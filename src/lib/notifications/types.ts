export type NotificationPermissionStatus =
  | "not-requested"
  | "granted"
  | "denied"
  | "unsupported";

export type NotificationPreferences = {
  enabled: boolean;
  workoutReminders: boolean;
  inactivityReminders: boolean;
  inactivityDays: number;
  habitReminders: boolean;
  weeklyCheckIn: boolean;
  mealPlanning: boolean;
  preferredTime: string;
};

export type NotificationPreferenceKey =
  | "workoutReminders"
  | "inactivityReminders"
  | "habitReminders"
  | "weeklyCheckIn"
  | "mealPlanning";

export const defaultNotificationPreferences: NotificationPreferences = {
  enabled: false,
  workoutReminders: false,
  inactivityReminders: false,
  inactivityDays: 5,
  habitReminders: false,
  weeklyCheckIn: false,
  mealPlanning: false,
  preferredTime: "07:00",
};
