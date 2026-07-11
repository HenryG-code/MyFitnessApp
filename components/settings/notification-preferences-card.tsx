"use client";

import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  sendTestNotification,
} from "@/src/lib/notifications/browser";
import {
  getDisabledNotificationPreferences,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from "@/src/lib/notifications/storage";
import {
  ensurePushSubscription,
  removePushSubscription,
  type PushSetupResult,
} from "@/src/lib/notifications/push";
import {
  type NotificationPreferenceKey,
  type NotificationPermissionStatus,
  type NotificationPreferences,
} from "@/src/lib/notifications/types";
import {
  announcePreferenceSyncStatus,
  ensureUserPreferences,
  parseNotificationPreferences,
  updateNotificationPreferences,
} from "@/src/lib/user-preferences/queries";
import { Bell, BellOff, Clock, Send } from "lucide-react";
import { useEffect, useState } from "react";

const reminderOptions: Array<{
  key: NotificationPreferenceKey;
  label: string;
  description: string;
}> = [
  {
    key: "workoutReminders",
    label: "Workout reminders",
    description: "Gentle nudges to keep training on your radar.",
  },
  {
    key: "inactivityReminders",
    label: "Comeback motivation",
    description:
      "A private motivational nudge when you have not trained for your chosen number of days.",
  },
  {
    key: "habitReminders",
    label: "Daily habit reminders",
    description: "A simple check-in for today's healthy habits.",
  },
  {
    key: "weeklyCheckIn",
    label: "Weekly check-in",
    description: "A calm reminder to review the week and reset.",
  },
  {
    key: "mealPlanning",
    label: "Meal planning",
    description: "A prompt to plan meals before the week gets busy.",
  },
];

const inactivityDayOptions = [2, 3, 5, 7, 10, 14];

const permissionLabels: Record<NotificationPermissionStatus, string> = {
  "not-requested": "Not requested",
  granted: "Granted",
  denied: "Denied",
  unsupported: "Unsupported",
};

function getStatusMessage(
  permissionStatus: NotificationPermissionStatus,
  preferences: NotificationPreferences
) {
  if (permissionStatus === "unsupported") {
    return "Notifications are not supported in this browser.";
  }

  if (permissionStatus === "denied") {
    return "Notifications are blocked in your browser settings.";
  }

  return preferences.enabled ? "Reminders are on." : "Reminders are off.";
}

function getPushSetupMessage(result: PushSetupResult) {
  if (result === "subscribed") {
    return "Notifications are enabled on this device, including background delivery.";
  }

  if (result === "unconfigured") {
    return "Browser notifications are enabled. Add the web-push environment keys for background delivery.";
  }

  if (result === "unsupported") {
    return "Browser notifications are enabled while LogFit is open; this device does not support background push.";
  }

  return "Allow notifications before enabling background delivery.";
}

export function NotificationPreferencesCard() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    loadNotificationPreferences
  );
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>(getNotificationPermissionStatus);
  const [message, setMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const storedPreferences = loadNotificationPreferences();

    async function loadSyncedPreferences() {
      try {
        const preferencesRow = await ensureUserPreferences();
        const syncedPreferences = parseNotificationPreferences(preferencesRow);

        if (syncedPreferences) {
          if (isMounted) {
            setPreferences(syncedPreferences);
            saveNotificationPreferences(syncedPreferences);
            announcePreferenceSyncStatus("synced");
          }
        } else {
          await updateNotificationPreferences(storedPreferences);
        }
      } catch {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      }
    }

    void loadSyncedPreferences();

    return () => {
      isMounted = false;
    };
  }, []);

  function persistPreferences(nextPreferences: NotificationPreferences) {
    setPreferences(nextPreferences);
    saveNotificationPreferences(nextPreferences);
    updateNotificationPreferences(nextPreferences).catch(() => {
      announcePreferenceSyncStatus("fallback", "Saved on this device.");
    });
  }

  async function handleEnableNotifications() {
    setIsRequesting(true);
    setMessage("");

    try {
      const nextPermissionStatus = await requestNotificationPermission();
      setPermissionStatus(nextPermissionStatus);

      if (nextPermissionStatus === "granted") {
        persistPreferences({ ...preferences, enabled: true });
        try {
          const pushResult = await ensurePushSubscription();
          setMessage(getPushSetupMessage(pushResult));
        } catch (pushError) {
          setMessage(
            pushError instanceof Error
              ? `${pushError.message} Notifications will still work while LogFit is open.`
              : "Background delivery could not be enabled. Notifications will still work while LogFit is open."
          );
        }
      } else if (nextPermissionStatus === "denied") {
        persistPreferences(getDisabledNotificationPreferences(preferences));
        setMessage("Notifications are blocked in your browser settings.");
      } else if (nextPermissionStatus === "unsupported") {
        persistPreferences(getDisabledNotificationPreferences(preferences));
        setMessage("This browser does not support notifications.");
      } else {
        setMessage("Notifications were not enabled yet.");
      }
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleDisableReminders() {
    persistPreferences(getDisabledNotificationPreferences(preferences));
    await removePushSubscription().catch(() => undefined);
    setPermissionStatus(getNotificationPermissionStatus());
    setMessage("Reminders are off.");
  }

  async function handleTogglePreference(
    key: NotificationPreferenceKey,
    checked: boolean
  ) {
    if (!preferences.enabled || permissionStatus !== "granted") {
      setMessage("Enable notifications first, then choose your reminders.");
      return;
    }

    const nextPreferences = { ...preferences, [key]: checked };
    persistPreferences(nextPreferences);

    if (key === "inactivityReminders" && checked) {
      try {
        const pushResult = await ensurePushSubscription();
        setMessage(getPushSetupMessage(pushResult));
        return;
      } catch (pushError) {
        setMessage(
          pushError instanceof Error
            ? `${pushError.message} In-app reminders will still work.`
            : "Background delivery could not be enabled. In-app reminders will still work."
        );
        return;
      }
    }

    setMessage("Notification preferences saved.");
  }

  function handlePreferredTimeChange(value: string) {
    persistPreferences({ ...preferences, preferredTime: value || "07:00" });
    setMessage("Preferred reminder time saved.");
  }

  function handleInactivityDaysChange(value: string) {
    persistPreferences({
      ...preferences,
      inactivityDays: Number(value) || 5,
    });
    setMessage("Comeback reminder timing saved.");
  }

  async function handleSendTestNotification() {
    const didSend = await sendTestNotification();
    setPermissionStatus(getNotificationPermissionStatus());
    setMessage(
      didSend
        ? "Test notification sent."
        : "Enable notifications before sending a test."
    );
  }

  const canUseReminders =
    preferences.enabled && permissionStatus === "granted" && !isRequesting;
  const canSendTest = permissionStatus === "granted";

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 shadow-sm shadow-accent/25 sm:size-12 sm:rounded-2xl">
            <Bell className="size-5" />
          </span>
          <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-accent sm:mt-5">
            Notifications
          </p>
          <h2 className="mt-1 font-display text-xl font-black sm:mt-2 sm:text-2xl">
            Notification preferences
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted sm:mt-3 sm:text-sm sm:leading-6">
            Notifications depend on your browser and device settings. You can
            turn reminders off anytime.
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white/65 p-3 text-xs sm:rounded-[1.25rem] sm:p-4 sm:text-sm">
          <p className="font-black text-foreground">
            Permission: {permissionLabels[permissionStatus]}
          </p>
          <p className="mt-1 text-muted">
            {getStatusMessage(permissionStatus, preferences)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        <button
          type="button"
          onClick={handleEnableNotifications}
          disabled={isRequesting || permissionStatus === "unsupported"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-3 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        >
          <Bell className="size-4" />
          {isRequesting ? "Requesting..." : "Enable notifications"}
        </button>
        <button
          type="button"
          onClick={() => void handleDisableReminders()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/75 px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:border-accent sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        >
          <BellOff className="size-4" />
          Disable reminders
        </button>
        <button
          type="button"
          onClick={() => void handleSendTestNotification()}
          disabled={!canSendTest}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white/75 px-3 py-2.5 text-xs font-black transition hover:-translate-y-0.5 hover:border-accent disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 sm:col-span-1 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        >
          <Send className="size-4" />
          Send test notification
        </button>
      </div>

      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-line bg-surface/80 p-3 sm:rounded-[1.25rem] sm:p-4">
        <label
          htmlFor="preferredTime"
          className="flex items-center gap-2 text-sm font-black"
        >
          <Clock className="size-4 text-accent" />
          Preferred reminder time
        </label>
        <p className="mt-2 text-sm leading-6 text-muted">
          Used for your reminder preferences on this device.
        </p>
        <input
          id="preferredTime"
          type="time"
          value={preferences.preferredTime}
          disabled={!canUseReminders}
          onChange={(event) => handlePreferredTimeChange(event.target.value)}
          className="mt-3 min-h-10 w-full rounded-xl border border-line bg-[#080807] px-3 py-2 text-sm font-black text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted disabled:opacity-70 sm:mt-4 sm:min-h-12 sm:max-w-xs sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
        />
      </div>
      <div className="rounded-xl border border-line bg-surface/80 p-3 sm:rounded-[1.25rem] sm:p-4">
        <label
          htmlFor="inactivityDays"
          className="flex items-center gap-2 text-sm font-black"
        >
          <BellOff className="size-4 text-accent" />
          Remind me after
        </label>
        <p className="mt-2 text-sm leading-6 text-muted">
          Wait this many days after the latest logged workout before sending a
          comeback message.
        </p>
        <select
          id="inactivityDays"
          value={preferences.inactivityDays}
          disabled={!canUseReminders || !preferences.inactivityReminders}
          onChange={(event) => handleInactivityDaysChange(event.target.value)}
          className="mt-3 min-h-10 w-full rounded-xl border border-line bg-[#080807] px-3 py-2 text-sm font-black text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-muted disabled:opacity-70 sm:mt-4 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-base"
        >
          {inactivityDayOptions.map((days) => (
            <option key={days} value={days}>
              {days} days without training
            </option>
          ))}
        </select>
      </div>
      </div>

      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
        {reminderOptions.map((option) => (
          <label
            key={option.key}
            className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:border-accent sm:gap-3 sm:rounded-[1.25rem] sm:p-4 ${
              preferences[option.key]
                ? "liftlog-complete-pulse border-accent/30 bg-accent/10"
                : "border-line bg-white/65"
            }`}
          >
            <input
              type="checkbox"
              checked={preferences[option.key]}
              disabled={!canUseReminders}
              onChange={(event) =>
                void handleTogglePreference(option.key, event.target.checked)
              }
              className="mt-1 size-5 rounded border-line text-accent focus:ring-accent disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>
              <span className="block font-display text-lg font-black">
                {option.label}
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {!canUseReminders ? (
        <p className="rounded-2xl border border-dashed border-line bg-white/50 p-4 text-sm font-black text-muted">
          Enable notifications to choose reminder types.
        </p>
      ) : null}

      {message ? (
        <p className="liftlog-pop-in rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm font-black text-accent">
          {message}
        </p>
      ) : null}
    </div>
  );
}
