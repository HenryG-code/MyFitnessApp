import {
  getDateInTimeZone,
  getDaysBetweenDates,
  getInactivityMotivation,
} from "@/src/lib/notifications/motivation";
import { normalizeNotificationPreferences } from "@/src/lib/notifications/storage";
import type { Database, PushSubscription } from "@/src/lib/supabase/database.types";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotificationEnvironment = {
  supabaseUrl: string;
  serviceRoleKey: string;
  publicKey: string;
  privateKey: string;
  cronSecret: string;
  contact: string;
};

function getRequiredEnvironment(): NotificationEnvironment | null {
  const values = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    publicKey: process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
    privateKey: process.env.WEB_PUSH_PRIVATE_KEY,
    cronSecret: process.env.CRON_SECRET,
    contact: process.env.WEB_PUSH_CONTACT ?? "mailto:support@example.com",
  };

  if (
    !values.supabaseUrl ||
    !values.serviceRoleKey ||
    !values.publicKey ||
    !values.privateKey ||
    !values.cronSecret ||
    !values.contact
  ) {
    return null;
  }

  return {
    supabaseUrl: values.supabaseUrl,
    serviceRoleKey: values.serviceRoleKey,
    publicKey: values.publicKey,
    privateKey: values.privateKey,
    cronSecret: values.cronSecret,
    contact: values.contact,
  } as NotificationEnvironment;
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
  const environment = getRequiredEnvironment();

  if (!environment) {
    return NextResponse.json(
      { error: "Background notifications are not fully configured." },
      { status: 503 }
    );
  }

  if (
    request.headers.get("authorization") !==
    `Bearer ${environment.cronSecret}`
  ) {
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
  const latestWorkoutByUser = new Map<string, string | null | undefined>();

  await Promise.all(
    userIds.map(async (userId) => {
      const { data, error } = await supabase
        .from("workouts")
        .select("workout_date")
        .eq("user_id", userId)
        .order("workout_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      latestWorkoutByUser.set(
        userId,
        error ? undefined : (data?.workout_date ?? null)
      );
    })
  );

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
    const latestWorkoutDate = latestWorkoutByUser.get(subscription.user_id);

    if (latestWorkoutDate === undefined) {
      result.skipped += 1;
      continue;
    }

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
