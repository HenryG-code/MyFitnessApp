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

export async function showBrowserNotification(
  title: string,
  options: NotificationOptions = {}
) {
  if (getNotificationPermissionStatus() !== "granted") {
    return false;
  }

  if ("serviceWorker" in navigator) {
    try {
      const existing = await navigator.serviceWorker.getRegistration("/");

      if (!existing) {
        await navigator.serviceWorker.register("/notification-sw.js", {
          scope: "/",
        });
      }

      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(title, options);
      return true;
    } catch {
      // Fall through to the page-level Notification API.
    }
  }

  new Notification(title, options);

  return true;
}

export async function sendTestNotification() {
  return showBrowserNotification("LogFit reminder", {
    body: "Your next session is one small decision away.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: "logfit-test",
  });
}
