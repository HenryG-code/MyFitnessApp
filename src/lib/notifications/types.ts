export type NotificationPermissionStatus =
  | "not-requested"
  | "granted"
  | "denied"
  | "unsupported";

export type NotificationPreferences = {
  enabled: boolean;
  workoutReminders: boolean;
  habitReminders: boolean;
  weeklyCheckIn: boolean;
  mealPlanning: boolean;
  preferredTime: string;
};

export type NotificationPreferenceKey =
  | "workoutReminders"
  | "habitReminders"
  | "weeklyCheckIn"
  | "mealPlanning";

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: false,
  workoutReminders: false,
  habitReminders: false,
  weeklyCheckIn: false,
  mealPlanning: false,
  preferredTime: "07:00",
};
