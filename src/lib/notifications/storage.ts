import {
  defaultNotificationPreferences,
  type NotificationPreferences,
} from "@/src/lib/notifications/types";

export const notificationPreferencesStorageKey =
  "liftlog-notification-preferences-v1";
export const lastInactivityNotificationStorageKey =
  "liftlog-last-inactivity-notification-v1";

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

function getInactivityDays(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return defaultNotificationPreferences.inactivityDays;
  }

  return Math.min(30, Math.max(2, Math.round(value)));
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
    inactivityReminders: getBooleanValue(
      value.inactivityReminders,
      defaultNotificationPreferences.inactivityReminders
    ),
    inactivityDays: getInactivityDays(value.inactivityDays),
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
    inactivityReminders: false,
    habitReminders: false,
    weeklyCheckIn: false,
    mealPlanning: false,
  };
}

export function loadLastInactivityNotificationDate() {
  if (!hasBrowserStorage()) {
    return null;
  }

  return window.localStorage.getItem(lastInactivityNotificationStorageKey);
}

export function saveLastInactivityNotificationDate(date: string) {
  if (!hasBrowserStorage()) {
    return;
  }

  window.localStorage.setItem(lastInactivityNotificationStorageKey, date);
}

export function resetNotificationPreferences() {
  saveNotificationPreferences(defaultNotificationPreferences);
  return defaultNotificationPreferences;
}
