import type { CheckedGroceryItems } from "@/src/lib/grocery-list/types";
import type { MealPlanState } from "@/src/lib/meal-planner/types";
import { normalizeNotificationPreferences } from "@/src/lib/notifications/storage";
import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from "@/src/lib/notifications/types";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  Json,
  UserPreferences,
  UserPreferencesUpdate,
} from "@/src/lib/supabase/database.types";
import { isTrainingGoal } from "@/src/lib/training-plans/storage";
import type { TrainingGoal } from "@/src/lib/training-plans/types";
import type { PreferenceSyncStatus } from "@/src/lib/user-preferences/types";
import { preferenceSyncStatusEventName } from "@/src/lib/user-preferences/types";

export function announcePreferenceSyncStatus(
  status: PreferenceSyncStatus,
  message?: string
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(preferenceSyncStatusEventName, {
      detail: { status, message },
    })
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function hasMeaningfulObject(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && Object.keys(value).length > 0;
}

export function hasSyncedMealPlan(value: unknown) {
  return hasMeaningfulObject(value);
}

export function hasSyncedCheckedItems(value: unknown) {
  return hasMeaningfulObject(value);
}

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
    throw new Error("Sign in to sync preferences.");
  }

  return { supabase, userId: user.id };
}

export async function fetchUserPreferences() {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Could not sync preferences.");
  }

  return data;
}

export async function ensureUserPreferences() {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    throw new Error("Could not sync preferences.");
  }

  return data satisfies UserPreferences;
}

export async function updateUserPreferences(update: UserPreferencesUpdate) {
  const { supabase, userId } = await getAuthenticatedUserId();
  announcePreferenceSyncStatus("syncing");

  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: userId, ...update }, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    announcePreferenceSyncStatus("fallback", "Saved on this device.");
    throw new Error("Could not sync preferences. Saved on this device.");
  }

  announcePreferenceSyncStatus("synced");
  return data satisfies UserPreferences;
}

export async function updateSelectedTrainingGoal(goal: TrainingGoal | null) {
  return updateUserPreferences({
    selected_training_goal: goal,
  });
}

export function parseSelectedTrainingGoal(
  preferences: UserPreferences | null
): TrainingGoal | null {
  return isTrainingGoal(preferences?.selected_training_goal)
    ? preferences.selected_training_goal
    : null;
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
) {
  const { preferredTime, ...reminderPreferences } = preferences;

  return updateUserPreferences({
    notification_preferences: toJson(reminderPreferences),
    preferred_reminder_time: preferredTime,
  });
}

export function parseNotificationPreferences(
  preferences: UserPreferences | null
): NotificationPreferences | null {
  const storedPreferences = preferences?.notification_preferences;

  if (!hasMeaningfulObject(storedPreferences)) {
    return null;
  }

  return normalizeNotificationPreferences({
    ...storedPreferences,
    preferredTime:
      preferences?.preferred_reminder_time ??
      defaultNotificationPreferences.preferredTime,
  });
}

export async function updateMealPlan(plan: MealPlanState) {
  return updateUserPreferences({
    meal_plan: toJson(plan),
  });
}

export function parseMealPlan(preferences: UserPreferences | null) {
  return hasSyncedMealPlan(preferences?.meal_plan)
    ? preferences?.meal_plan
    : null;
}

export async function updateGroceryCheckedItems(
  checkedItems: CheckedGroceryItems
) {
  return updateUserPreferences({
    grocery_checked_items: toJson(checkedItems),
  });
}

export function parseGroceryCheckedItems(preferences: UserPreferences | null) {
  return hasSyncedCheckedItems(preferences?.grocery_checked_items)
    ? preferences?.grocery_checked_items
    : null;
}
