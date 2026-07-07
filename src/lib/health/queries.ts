import { getDateDaysAgo, getDateInputValue } from "@/src/lib/habits/queries";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  HealthConnection,
  HealthDailyMetric,
  HealthPlatform,
} from "@/src/lib/supabase/database.types";

export type HealthGoals = {
  dailySteps: number;
  sleepMinutes: number;
  weeklyActiveMinutes: number;
};

export const defaultHealthGoals: HealthGoals = {
  dailySteps: 10_000,
  sleepMinutes: 8 * 60,
  weeklyActiveMinutes: 150,
};

export type HealthSummary = {
  connection: HealthConnection | null;
  today: HealthDailyMetric | null;
  /** Last 14 days ascending by date (may be sparse). */
  recent: HealthDailyMetric[];
  goals: HealthGoals;
};

export const emptyHealthSummary: HealthSummary = {
  connection: null,
  today: null,
  recent: [],
  goals: defaultHealthGoals,
};

export function parseHealthGoals(value: unknown): HealthGoals {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return defaultHealthGoals;
  }

  const record = value as Record<string, unknown>;
  const num = (key: string, fallback: number) =>
    typeof record[key] === "number" && (record[key] as number) > 0
      ? (record[key] as number)
      : fallback;

  return {
    dailySteps: num("dailySteps", defaultHealthGoals.dailySteps),
    sleepMinutes: num("sleepMinutes", defaultHealthGoals.sleepMinutes),
    weeklyActiveMinutes: num(
      "weeklyActiveMinutes",
      defaultHealthGoals.weeklyActiveMinutes
    ),
  };
}

/**
 * Loads the user's health connection, recent daily metrics, and goals.
 * Fails soft: if the health tables do not exist yet (migration not applied)
 * or any query errors, returns an empty summary so existing manual flows
 * keep working unchanged.
 */
export async function fetchHealthSummary(): Promise<HealthSummary> {
  try {
    const supabase = createBrowserSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return emptyHealthSummary;
    }

    const today = getDateInputValue();
    const since = getDateDaysAgo(13);

    const [connectionResult, metricsResult, preferencesResult] =
      await Promise.all([
        supabase
          .from("health_connections")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "connected")
          .order("last_synced_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("health_daily_metrics")
          .select("*")
          .eq("user_id", user.id)
          .gte("metric_date", since)
          .lte("metric_date", today)
          .order("metric_date", { ascending: true }),
        supabase
          .from("user_preferences")
          .select("health_goals")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

    if (connectionResult.error || metricsResult.error) {
      return emptyHealthSummary;
    }

    const recent = metricsResult.data ?? [];

    return {
      connection: connectionResult.data,
      today: recent.find((metric) => metric.metric_date === today) ?? null,
      recent,
      goals: parseHealthGoals(
        preferencesResult.error ? null : preferencesResult.data?.health_goals
      ),
    };
  } catch {
    return emptyHealthSummary;
  }
}

export async function disconnectHealthPlatform(platform: HealthPlatform) {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("health_connections")
    .update({ status: "disconnected" })
    .eq("user_id", user.id)
    .eq("platform", platform);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteImportedHealthData(platform: HealthPlatform) {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("health_daily_metrics")
    .delete()
    .eq("user_id", user.id)
    .eq("platform", platform);

  if (error) {
    throw new Error(error.message);
  }
}

// ————— formatting + derived helpers —————

export function formatSleep(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder.toString().padStart(2, "0")}m`;
}

export function platformLabel(platform: HealthPlatform) {
  return platform === "apple_health" ? "Apple Health" : "Health Connect";
}

export function formatRelativeTime(iso: string | null) {
  if (!iso) {
    return "Never";
  }

  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(deltaMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** Average resting HR over recent days, excluding the given date. */
export function restingHeartRateBaseline(
  recent: HealthDailyMetric[],
  excludeDate?: string
) {
  const values = recent
    .filter(
      (metric) =>
        metric.resting_heart_rate_bpm !== null &&
        metric.metric_date !== excludeDate
    )
    .map((metric) => metric.resting_heart_rate_bpm as number);

  if (values.length < 3) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function weeklyActiveMinutes(recent: HealthDailyMetric[]) {
  const since = getDateDaysAgo(6);

  return recent
    .filter((metric) => metric.metric_date >= since)
    .reduce((sum, metric) => sum + (metric.exercise_minutes ?? 0), 0);
}

export function weeklySteps(recent: HealthDailyMetric[]) {
  const since = getDateDaysAgo(6);

  return recent
    .filter((metric) => metric.metric_date >= since)
    .reduce((sum, metric) => sum + (metric.steps ?? 0), 0);
}

export function averageSleepMinutes(
  recent: HealthDailyMetric[],
  sinceDaysAgo = 6
) {
  const since = getDateDaysAgo(sinceDaysAgo);
  const values = recent
    .filter(
      (metric) => metric.metric_date >= since && metric.sleep_minutes !== null
    )
    .map((metric) => metric.sleep_minutes as number);

  if (!values.length) {
    return null;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length
  );
}
