import { showBrowserNotification } from "@/src/lib/notifications/browser";
import {
  getDateInTimeZone,
  getDaysBetweenDates,
  getInactivityMotivation,
} from "@/src/lib/notifications/motivation";
import {
  loadLastInactivityNotificationDate,
  loadNotificationPreferences,
  saveLastInactivityNotificationDate,
} from "@/src/lib/notifications/storage";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";

function hasReachedPreferredTime(preferredTime: string, now: Date) {
  const [hours = 7, minutes = 0] = preferredTime
    .split(":")
    .map((value) => Number(value));

  return now.getHours() * 60 + now.getMinutes() >= hours * 60 + minutes;
}

export async function maybeSendInactivityReminder() {
  const preferences = loadNotificationPreferences();

  if (
    !preferences.enabled ||
    !preferences.inactivityReminders ||
    typeof Notification === "undefined" ||
    Notification.permission !== "granted"
  ) {
    return false;
  }

  const now = new Date();
  const today = getDateInTimeZone(now);

  if (
    !hasReachedPreferredTime(preferences.preferredTime, now) ||
    loadLastInactivityNotificationDate() === today
  ) {
    return false;
  }

  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: latestDelivery } = await supabase
    .from("push_subscriptions")
    .select("last_inactivity_notification_at")
    .eq("user_id", user.id)
    .not("last_inactivity_notification_at", "is", null)
    .order("last_inactivity_notification_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    latestDelivery?.last_inactivity_notification_at &&
    getDateInTimeZone(
      new Date(latestDelivery.last_inactivity_notification_at)
    ) === today
  ) {
    saveLastInactivityNotificationDate(today);
    return false;
  }

  const { data: latestWorkout, error } = await supabase
    .from("workouts")
    .select("workout_date")
    .eq("user_id", user.id)
    .order("workout_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }

  const startingDate = latestWorkout?.workout_date ?? user.created_at.slice(0, 10);
  const daysInactive = getDaysBetweenDates(startingDate, today);

  if (daysInactive < preferences.inactivityDays) {
    return false;
  }

  const motivation = getInactivityMotivation(daysInactive, `${user.id}-${today}`);
  const sent = await showBrowserNotification(motivation.title, {
    body: motivation.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "logfit-training-inactivity",
    data: { url: motivation.url },
  });

  if (sent) {
    saveLastInactivityNotificationDate(today);
  }

  return sent;
}
