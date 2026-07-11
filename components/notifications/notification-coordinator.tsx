"use client";

import { maybeSendInactivityReminder } from "@/src/lib/notifications/inactivity";
import { useEffect } from "react";

const reminderCheckIntervalMs = 15 * 60 * 1000;

export function NotificationCoordinator() {
  useEffect(() => {
    function check() {
      if (document.visibilityState === "visible") {
        void maybeSendInactivityReminder();
      }
    }

    check();
    const interval = window.setInterval(check, reminderCheckIntervalMs);
    document.addEventListener("visibilitychange", check);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return null;
}
