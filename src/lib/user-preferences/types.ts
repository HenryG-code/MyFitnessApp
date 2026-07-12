import type { CheckedGroceryItems } from "@/src/lib/grocery-list/types";
import type { MealPlanState } from "@/src/lib/meal-planner/types";
import type { NotificationPreferences } from "@/src/lib/notifications/types";
import type { RunningPlanState } from "@/src/lib/running-plans/types";
import type { TrainingGoal, TrainingLevel } from "@/src/lib/training-plans/types";

export type PreferenceSyncStatus = "idle" | "syncing" | "synced" | "fallback" | "error";

export type SyncedNotificationPreferences = NotificationPreferences;

export type UserPreferenceValues = {
  selectedTrainingGoal: TrainingGoal | null;
  selectedTrainingLevel: TrainingLevel | null;
  notificationPreferences: SyncedNotificationPreferences | null;
  mealPlan: MealPlanState | null;
  groceryCheckedItems: CheckedGroceryItems | null;
  runningPlan: RunningPlanState | null;
};

export const preferenceSyncStatusEventName = "liftlog-preference-sync-status";

export type PreferenceSyncStatusEventDetail = {
  status: PreferenceSyncStatus;
  message?: string;
};
