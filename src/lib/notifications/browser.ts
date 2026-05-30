import type { NotificationPermissionStatus } from "@/src/lib/notifications/types";

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "default") {
    return "not-requested";
  }

  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  const permission = await Notification.requestPermission();

  if (permission === "default") {
    return "not-requested";
  }

  return permission;
}

export function sendTestNotification() {
  if (getNotificationPermissionStatus() !== "granted") {
    return false;
  }

  new Notification("LiftLog reminder", {
    body: "Time to check in with your fitness goals.",
  });

  return true;
}
