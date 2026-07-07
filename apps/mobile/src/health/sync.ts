import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { healthProvider } from "./provider";
import {
  getDateDaysAgo,
  getLocalDateValue,
  type DailyHealthMetrics,
  type HealthPermissionCategory,
} from "./types";

/** Initial + rolling window: enough for goals, baselines, and reports. */
const SYNC_WINDOW_DAYS = 14;
const LAST_SYNC_KEY = "logfit-health-last-sync-v1";
const GRANTED_KEY = "logfit-health-granted-v1";

export type SyncResult =
  | { status: "ok"; days: number; syncedAt: string }
  | { status: "empty"; syncedAt: string }
  | { status: "error"; message: string };

export const defaultCategories: HealthPermissionCategory[] = [
  "steps",
  "sleep",
  "restingHeartRate",
  "activeEnergy",
  "distance",
  "weight",
  "exercise",
];

export async function getStoredGrantedCategories(): Promise<
  HealthPermissionCategory[]
> {
  try {
    const raw = await AsyncStorage.getItem(GRANTED_KEY);
    return raw ? (JSON.parse(raw) as HealthPermissionCategory[]) : [];
  } catch {
    return [];
  }
}

export async function storeGrantedCategories(
  categories: HealthPermissionCategory[]
) {
  await AsyncStorage.setItem(GRANTED_KEY, JSON.stringify(categories));
}

export async function getLastSyncTime(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch {
    return null;
  }
}

function hasAnyValue(metrics: DailyHealthMetrics) {
  return (
    metrics.steps !== null ||
    metrics.sleepMinutes !== null ||
    metrics.restingHeartRateBpm !== null ||
    metrics.activeEnergyKcal !== null ||
    metrics.distanceMeters !== null ||
    metrics.weightKg !== null ||
    metrics.exerciseMinutes !== null
  );
}

/**
 * Reads the recent daily window from the platform health layer and upserts
 * it into Supabase. Idempotent: rows key on (user_id, metric_date, platform),
 * so repeated syncs update rather than duplicate.
 */
export async function syncHealthData(): Promise<SyncResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: "You are signed out." };
  }

  const availability = await healthProvider.getAvailability();

  if (availability !== "available") {
    return {
      status: "error",
      message:
        availability === "needs-install"
          ? "Health Connect needs to be installed or updated."
          : "Health data is not available on this device.",
    };
  }

  let daily: DailyHealthMetrics[];

  try {
    daily = await healthProvider.readDailyMetrics(
      getDateDaysAgo(SYNC_WINDOW_DAYS - 1),
      getLocalDateValue()
    );
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Could not read health data.",
    };
  }

  const rows = daily.filter(hasAnyValue).map((metrics) => ({
    user_id: user.id,
    metric_date: metrics.metricDate,
    platform: healthProvider.platform,
    source_name:
      healthProvider.platform === "apple_health"
        ? "Apple Health"
        : "Health Connect",
    steps: metrics.steps,
    sleep_minutes: metrics.sleepMinutes,
    resting_heart_rate_bpm: metrics.restingHeartRateBpm,
    active_energy_kcal: metrics.activeEnergyKcal,
    distance_meters: metrics.distanceMeters,
    weight_kg: metrics.weightKg,
    exercise_minutes: metrics.exerciseMinutes,
  }));

  const syncedAt = new Date().toISOString();

  if (rows.length) {
    const { error } = await supabase
      .from("health_daily_metrics")
      .upsert(rows, { onConflict: "user_id,metric_date,platform" });

    if (error) {
      return { status: "error", message: error.message };
    }
  }

  const granted = await getStoredGrantedCategories();
  const { error: connectionError } = await supabase
    .from("health_connections")
    .upsert(
      {
        user_id: user.id,
        platform: healthProvider.platform,
        status: "connected",
        permissions: { granted },
        last_synced_at: syncedAt,
      },
      { onConflict: "user_id,platform" }
    );

  if (connectionError) {
    return { status: "error", message: connectionError.message };
  }

  await AsyncStorage.setItem(LAST_SYNC_KEY, syncedAt);

  return rows.length
    ? { status: "ok", days: rows.length, syncedAt }
    : { status: "empty", syncedAt };
}

/** Clear device-local sync state (used on logout). Supabase data stays. */
export async function clearLocalSyncState() {
  await AsyncStorage.multiRemove([LAST_SYNC_KEY, GRANTED_KEY]);
}
