import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  DailyHabit,
  DailyHabitInsert,
  DailyHabitUpdate,
} from "@/src/lib/supabase/database.types";

export type DefaultHabit = {
  habit_key: string;
  label: string;
  target_value: number;
  unit: string;
};

export const defaultHabits: DefaultHabit[] = [
  {
    habit_key: "sleep_8_hours",
    label: "Sleep 8 hours",
    target_value: 8,
    unit: "hours",
  },
  {
    habit_key: "trained",
    label: "Trained",
    target_value: 1,
    unit: "session",
  },
  {
    habit_key: "walked_10k_steps",
    label: "Walked 10k steps",
    target_value: 10000,
    unit: "steps",
  },
  {
    habit_key: "ate_healthy",
    label: "Ate healthy",
    target_value: 1,
    unit: "day",
  },
  {
    habit_key: "no_late_food",
    label: "No food 3 hours before bed",
    target_value: 1,
    unit: "day",
  },
  {
    habit_key: "limited_alcohol",
    label: "Limited alcohol",
    target_value: 1,
    unit: "day",
  },
  {
    habit_key: "clean_environment",
    label: "Clean environment",
    target_value: 1,
    unit: "day",
  },
];

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

export async function fetchHabitsForDate(habitDate: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_date", habitDate)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit[];
}

export async function ensureDefaultHabitsForDate(habitDate: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: existing, error: fetchError } = await supabase
    .from("daily_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("habit_date", habitDate);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const existingKeys = new Set(existing.map((habit) => habit.habit_key));
  const missingHabits: DailyHabitInsert[] = defaultHabits
    .filter((habit) => !existingKeys.has(habit.habit_key))
    .map((habit) => ({
      user_id: userId,
      habit_date: habitDate,
      habit_key: habit.habit_key,
      label: habit.label,
      target_value: habit.target_value,
      completed_value: null,
      unit: habit.unit,
      is_completed: false,
    }));

  if (missingHabits.length) {
    const { error: insertError } = await supabase
      .from("daily_habits")
      .upsert(missingHabits, {
        onConflict: "user_id,habit_date,habit_key",
        ignoreDuplicates: true,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return fetchHabitsForDate(habitDate);
}

export async function toggleHabitCompletion(habit: DailyHabit) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const nextIsCompleted = !habit.is_completed;
  const payload: DailyHabitUpdate = {
    is_completed: nextIsCompleted,
    completed_value:
      nextIsCompleted && habit.completed_value === null
        ? habit.target_value
        : habit.completed_value,
  };

  const { data, error } = await supabase
    .from("daily_habits")
    .update(payload)
    .eq("id", habit.id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit;
}

export async function updateHabitCompletedValue(
  habit: DailyHabit,
  completedValue: number
) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const targetValue = habit.target_value ?? 0;
  const payload: DailyHabitUpdate = {
    completed_value: completedValue,
    is_completed: targetValue > 0 ? completedValue >= targetValue : false,
  };

  const { data, error } = await supabase
    .from("daily_habits")
    .update(payload)
    .eq("id", habit.id)
    .eq("user_id", userId)
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
    .order("habit_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies DailyHabit[];
}
