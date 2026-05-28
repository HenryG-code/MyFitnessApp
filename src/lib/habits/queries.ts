import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  DailyHabit,
  DailyHabitInsert,
  DailyHabitUpdate,
  HabitKey,
} from "@/src/lib/supabase/database.types";

export async function getAuthenticatedUserId() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to manage habits.");
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

export async function fetchHabitRowForDate(habitDate: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_date", habitDate)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit | null;
}

export async function ensureHabitRowForDate(habitDate: string) {
  const existing = await fetchHabitRowForDate(habitDate);

  if (existing) {
    return existing;
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: DailyHabitInsert = {
    user_id: userId,
    habit_date: habitDate,
    sleep_8_hours: false,
    trained: false,
    walked_10k_steps: false,
    ate_healthy: false,
    no_late_food: false,
    limited_alcohol: false,
    clean_environment: false,
  };

  const { data, error } = await supabase
    .from("daily_habits")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit;
}

export async function toggleHabitField(
  habitDate: string,
  habitKey: HabitKey,
  nextValue: boolean
) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: DailyHabitUpdate = {
    [habitKey]: nextValue,
  };

  const { data, error } = await supabase
    .from("daily_habits")
    .update(payload)
    .eq("user_id", userId)
    .eq("habit_date", habitDate)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit;
}

export async function fetchRecentHabitHistory(days = 7) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const endDate = getDateInputValue();
  const startDate = getDateDaysAgo(days - 1);
  const { data, error } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("user_id", userId)
    .gte("habit_date", startDate)
    .lte("habit_date", endDate)
    .order("habit_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit[];
}
