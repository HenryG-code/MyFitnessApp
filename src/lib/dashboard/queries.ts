import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  DailyHabit,
  Profile,
  WeightLog,
  Workout,
} from "@/src/lib/supabase/database.types";

export type DashboardData = {
  profile: Profile | null;
  goalWeightKg: number | null;
  firstWeight: WeightLog | null;
  latestWeight: WeightLog | null;
  recentWeights: WeightLog[];
  todayHabits: DailyHabit | null;
  recentHabits: DailyHabit[];
  latestWorkout: Workout | null;
  workoutsThisWeek: Workout[];
  workoutsLastSevenDays: Workout[];
};

export const habitKeys = [
  "sleep_8_hours",
  "trained",
  "walked_10k_steps",
  "ate_healthy",
  "no_late_food",
  "limited_alcohol",
  "clean_environment",
] as const;

async function getAuthenticatedUserId() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to view dashboard data.");
  }

  return { supabase, userId: user.id };
}

export function getDateInputValue(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateInputValue(date);
}

function getStartOfWeekDate() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());

  return getDateInputValue(start);
}

export function countCompletedHabits(row: DailyHabit | null) {
  if (!row) {
    return 0;
  }

  return habitKeys.filter((key) => row[key]).length;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { supabase, userId } = await getAuthenticatedUserId();
  const today = getDateInputValue();
  const sevenDaysAgo = getDateDaysAgo(6);
  const startOfWeek = getStartOfWeekDate();

  const [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitsResult,
    recentHabitsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", sevenDaysAgo)
      .lte("logged_at", today)
      .order("logged_at", { ascending: true }),
    supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", today)
      .maybeSingle(),
    supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", userId)
      .gte("habit_date", sevenDaysAgo)
      .lte("habit_date", today)
      .order("habit_date", { ascending: true }),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", startOfWeek)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", sevenDaysAgo)
      .lte("workout_date", today)
      .order("workout_date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const results = [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitsResult,
    recentHabitsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  return {
    profile: profileResult.data,
    goalWeightKg: profileResult.data?.goal_weight_kg ?? null,
    firstWeight: firstWeightResult.data,
    latestWeight: latestWeightResult.data,
    recentWeights: recentWeightsResult.data ?? [],
    todayHabits: todayHabitsResult.data,
    recentHabits: recentHabitsResult.data ?? [],
    latestWorkout: latestWorkoutResult.data,
    workoutsThisWeek: workoutsThisWeekResult.data ?? [],
    workoutsLastSevenDays: workoutsLastSevenDaysResult.data ?? [],
  };
}
