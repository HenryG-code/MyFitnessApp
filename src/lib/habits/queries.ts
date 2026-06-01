import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  HabitCompletion,
  HabitCompletionInsert,
  HabitDefinition,
  HabitDefinitionInsert,
  HabitDefinitionUpdate,
} from "@/src/lib/supabase/database.types";

export type HabitDefinitionInput = {
  name: string;
  description: string | null;
};

export type HabitDaySummary = {
  date: string;
  completed: number;
  total: number;
  percentage: number;
};

export const defaultHabits = [
  { name: "Sleep 8 hours", description: "Support recovery with enough rest." },
  { name: "Trained", description: "Complete a workout or planned session." },
  { name: "Walked 10k steps", description: "Keep daily movement visible." },
  { name: "Ate healthy", description: "Choose balanced meals today." },
  {
    name: "No food 3 hours before bed",
    description: "Give your body space to wind down.",
  },
  { name: "Limited alcohol", description: "Keep recovery and sleep protected." },
  {
    name: "Clean environment",
    description: "Reset your space so tomorrow starts easier.",
  },
] as const;

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

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function validateHabitInput(input: HabitDefinitionInput) {
  const name = input.name.trim().replace(/\s+/g, " ");
  const description = input.description?.trim() || null;

  if (name.length < 2) {
    throw new Error("Habit name must be at least 2 characters.");
  }

  if (name.length > 60) {
    throw new Error("Habit name must be 60 characters or less.");
  }

  if (description && description.length > 160) {
    throw new Error("Description must be 160 characters or less.");
  }

  return { name, description };
}

export async function fetchHabitDefinitions(options: { activeOnly?: boolean } = {}) {
  const { supabase, userId } = await getAuthenticatedUserId();
  let query = supabase
    .from("habit_definitions")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (options.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitDefinition[];
}

export async function ensureDefaultHabits() {
  const existingDefinitions = await fetchHabitDefinitions();

  if (existingDefinitions.length > 0) {
    return existingDefinitions;
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const payload = defaultHabits.map(
    (habit, index): HabitDefinitionInsert => ({
      user_id: userId,
      name: habit.name,
      description: habit.description,
      icon: null,
      sort_order: index + 1,
      is_active: true,
      is_default: true,
    })
  );

  const { data, error } = await supabase
    .from("habit_definitions")
    .insert(payload)
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitDefinition[];
}

export async function createHabitDefinition(input: HabitDefinitionInput) {
  const values = validateHabitInput(input);
  const definitions = await fetchHabitDefinitions();
  const duplicate = definitions.some(
    (habit) => habit.is_active && normalizeName(habit.name) === normalizeName(values.name)
  );

  if (duplicate) {
    throw new Error("You already have an active habit with that name.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const maxSortOrder = definitions.reduce(
    (max, habit) => Math.max(max, habit.sort_order),
    0
  );
  const payload: HabitDefinitionInsert = {
    user_id: userId,
    name: values.name,
    description: values.description,
    sort_order: maxSortOrder + 1,
    is_active: true,
    is_default: false,
  };

  const { data, error } = await supabase
    .from("habit_definitions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitDefinition;
}

export async function updateHabitDefinition(
  habitId: string,
  input: HabitDefinitionInput
) {
  const values = validateHabitInput(input);
  const definitions = await fetchHabitDefinitions();
  const duplicate = definitions.some(
    (habit) =>
      habit.id !== habitId &&
      habit.is_active &&
      normalizeName(habit.name) === normalizeName(values.name)
  );

  if (duplicate) {
    throw new Error("You already have an active habit with that name.");
  }

  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: HabitDefinitionUpdate = {
    name: values.name,
    description: values.description,
  };

  const { data, error } = await supabase
    .from("habit_definitions")
    .update(payload)
    .eq("id", habitId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitDefinition;
}

export async function hideHabitDefinition(habitId: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("habit_definitions")
    .update({ is_active: false })
    .eq("id", habitId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitDefinition;
}

export async function deleteHabitDefinition(habitId: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("habit_definitions")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchHabitCompletionsForDate(date: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("user_id", userId)
    .eq("completed_date", date);

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitCompletion[];
}

export async function toggleHabitCompletion(
  habitId: string,
  completedDate: string,
  nextValue: boolean
) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const payload: HabitCompletionInsert = {
    habit_id: habitId,
    user_id: userId,
    completed_date: completedDate,
    is_completed: nextValue,
  };

  // Keep one row per habit/date so history remains queryable even after undo.
  const { data, error } = await supabase
    .from("habit_completions")
    .upsert(payload, { onConflict: "habit_id,completed_date" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitCompletion;
}

export async function fetchRecentHabitCompletions(days = 7) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const endDate = getDateInputValue();
  const startDate = getDateDaysAgo(days - 1);
  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_date", startDate)
    .lte("completed_date", endDate)
    .order("completed_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data satisfies HabitCompletion[];
}

export function calculateHabitCompletionPercent(
  definitions: HabitDefinition[],
  completions: HabitCompletion[]
) {
  const activeDefinitions = definitions.filter((habit) => habit.is_active);
  const activeHabitIds = new Set(activeDefinitions.map((habit) => habit.id));
  const completed = completions.filter(
    (completion) =>
      completion.is_completed && activeHabitIds.has(completion.habit_id)
  ).length;
  const total = activeDefinitions.length;

  return {
    completed,
    total,
    percentage: total ? Math.round((completed / total) * 100) : 0,
  };
}

export function buildHabitDaySummary(
  date: string,
  definitions: HabitDefinition[],
  completions: HabitCompletion[]
): HabitDaySummary {
  return {
    date,
    ...calculateHabitCompletionPercent(definitions, completions),
  };
}
