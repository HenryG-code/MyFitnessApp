import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from "@/src/lib/notifications/types";

export const notificationPreferencesStorageKey =
  "liftlog-notification-preferences-v1";

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getBooleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function getPreferredTime(value: unknown) {
  if (typeof value !== "string") {
    return defaultNotificationPreferences.preferredTime;
  }

  return /^\d{2}:\d{2}$/.test(value)
    ? value
    : defaultNotificationPreferences.preferredTime;
}

export function normalizeNotificationPreferences(
  value: unknown
): NotificationPreferences {
  if (!isRecord(value)) {
    return defaultNotificationPreferences;
  }

  return {
    enabled: getBooleanValue(
      value.enabled,
      defaultNotificationPreferences.enabled
    ),
    workoutReminders: getBooleanValue(
      value.workoutReminders,
      defaultNotificationPreferences.workoutReminders
    ),
    habitReminders: getBooleanValue(
      value.habitReminders,
      defaultNotificationPreferences.habitReminders
    ),
    weeklyCheckIn: getBooleanValue(
      value.weeklyCheckIn,
      defaultNotificationPreferences.weeklyCheckIn
    ),
    mealPlanning: getBooleanValue(
      value.mealPlanning,
      defaultNotificationPreferences.mealPlanning
    ),
    preferredTime: getPreferredTime(value.preferredTime),
  };
}

export function loadNotificationPreferences(): NotificationPreferences {
  if (!hasBrowserStorage()) {
    return defaultNotificationPreferences;
  }

  try {
    const storedValue = window.localStorage.getItem(
      notificationPreferencesStorageKey
    );

    if (!storedValue) {
      return defaultNotificationPreferences;
    }

    return normalizeNotificationPreferences(JSON.parse(storedValue));
  } catch {
    return defaultNotificationPreferences;
  }
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences
) {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(
    notificationPreferencesStorageKey,
    JSON.stringify(normalizeNotificationPreferences(preferences))
  );
}

export function getDisabledNotificationPreferences(
  preferences: NotificationPreferences = defaultNotificationPreferences
): NotificationPreferences {
  return {
    ...preferences,
    enabled: false,
    workoutReminders: false,
    habitReminders: false,
    weeklyCheckIn: false,
    mealPlanning: false,
  };
}

export function resetNotificationPreferences() {
  saveNotificationPreferences(defaultNotificationPreferences);
  return defaultNotificationPreferences;
}
