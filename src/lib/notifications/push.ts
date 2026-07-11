import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";

export type PushSetupResult =
  | "subscribed"
  | "unconfigured"
  | "unsupported"
  | "permission-required";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const decoded = window.atob(base64);

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export async function ensurePushSubscription(): Promise<PushSetupResult> {
  if (!isPushSupported()) {
    return "unsupported";
  }

  if (Notification.permission !== "granted") {
    return "permission-required";
  }

  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;

  if (!publicKey) {
    return "unconfigured";
  }

  await navigator.serviceWorker.register("/notification-sw.js", { scope: "/" });
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sign in before enabling background notifications.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh,
      auth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      user_agent: navigator.userAgent.slice(0, 500),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    throw new Error("Could not save this device for background notifications.");
  }

  return "subscribed";
}

export async function removePushSubscription() {
  if (!isPushSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration("/");
  const subscription = await registration?.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const supabase = createBrowserSupabaseClient();
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", subscription.endpoint);
  await subscription.unsubscribe();
}
