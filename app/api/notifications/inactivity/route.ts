import { getNotificationEnvironment } from "@/src/lib/env";
import {
  getDateInTimeZone,
  getDaysBetweenDates,
  getInactivityMotivation,
} from "@/src/lib/notifications/motivation";
import { normalizeNotificationPreferences } from "@/src/lib/notifications/storage";
import type { Database, PushSubscription } from "@/src/lib/supabase/database.types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest, cronSecret: string) {
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${cronSecret}`);

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

function wasSentToday(subscription: PushSubscription, now: Date) {
  if (!subscription.last_inactivity_notification_at) {
    return false;
  }

  return (
    getDateInTimeZone(
      new Date(subscription.last_inactivity_notification_at),
      subscription.timezone
    ) === getDateInTimeZone(now, subscription.timezone)
  );
}

function getStatusCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const environment = getNotificationEnvironment();

  if (!environment) {
    return NextResponse.json(
      { error: "Background notifications are not fully configured." },
      { status: 503 }
    );
  }

  if (!isAuthorized(request, environment.cronSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  webpush.setVapidDetails(
    environment.contact,
    environment.publicKey,
    environment.privateKey
  );
  const supabase = createClient<Database>(
    environment.supabaseUrl,
    environment.serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (subscriptionsError) {
    return NextResponse.json(
      { error: "Could not load push subscriptions." },
      { status: 500 }
    );
  }

  const now = new Date();
  const userIds = [...new Set(subscriptions.map((item) => item.user_id))];
  const { data: preferenceRows } = userIds.length
    ? await supabase
        .from("user_preferences")
        .select("*")
        .in("user_id", userIds)
    : { data: [] };
  const preferencesByUser = new Map(
    (preferenceRows ?? []).map((row) => [row.user_id, row])
  );
  // One batched query instead of one query per subscribed user; rows arrive
  // newest-first, so the first row seen per user is their latest workout.
  const { data: workoutRows, error: workoutsError } = userIds.length
    ? await supabase
        .from("workouts")
        .select("user_id, workout_date")
        .in("user_id", userIds)
        .order("workout_date", { ascending: false })
    : { data: [], error: null };

  if (workoutsError) {
    return NextResponse.json(
      { error: "Could not load workout history." },
      { status: 500 }
    );
  }

  const latestWorkoutByUser = new Map<string, string | null>(
    userIds.map((userId) => [userId, null])
  );

  for (const row of workoutRows ?? []) {
    if (latestWorkoutByUser.get(row.user_id) === null) {
      latestWorkoutByUser.set(row.user_id, row.workout_date);
    }
  }

  const result = { processed: subscriptions.length, sent: 0, skipped: 0, removed: 0, errors: 0 };

  for (const subscription of subscriptions) {
    const row = preferencesByUser.get(subscription.user_id);
    const preferences = normalizeNotificationPreferences({
      ...(typeof row?.notification_preferences === "object"
        ? row.notification_preferences
        : {}),
      preferredTime: row?.preferred_reminder_time ?? undefined,
    });
    if (
      !preferences.enabled ||
      !preferences.inactivityReminders ||
      wasSentToday(subscription, now)
    ) {
      result.skipped += 1;
      continue;
    }

    const localDate = getDateInTimeZone(now, subscription.timezone);
    const latestWorkoutDate =
      latestWorkoutByUser.get(subscription.user_id) ?? null;

    const startingDate =
      latestWorkoutDate ?? subscription.created_at.slice(0, 10);
    const daysInactive = getDaysBetweenDates(startingDate, localDate);

    if (daysInactive < preferences.inactivityDays) {
      result.skipped += 1;
      continue;
    }

    const motivation = getInactivityMotivation(
      daysInactive,
      `${subscription.user_id}-${localDate}`
    );

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          ...motivation,
          tag: "logfit-training-inactivity",
        }),
        { TTL: 86_400 }
      );
      await supabase
        .from("push_subscriptions")
        .update({ last_inactivity_notification_at: now.toISOString() })
        .eq("id", subscription.id);
      result.sent += 1;
    } catch (error) {
      const statusCode = getStatusCode(error);

      if (statusCode === 404 || statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("id", subscription.id);
        result.removed += 1;
      } else {
        result.errors += 1;
      }
    }
  }

  return NextResponse.json(result);
}
