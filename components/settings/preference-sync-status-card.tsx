"use client";

import { SectionHeader } from "@/components/ui/fitness-card";
import { ensureUserPreferences } from "@/src/lib/user-preferences/queries";
import {
  preferenceSyncStatusEventName,
  type PreferenceSyncStatus,
  type PreferenceSyncStatusEventDetail,
} from "@/src/lib/user-preferences/types";
import { CheckCircle2, CloudOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const statusCopy: Record<PreferenceSyncStatus, string> = {
  idle: "Checking sync...",
  syncing: "Saving...",
  synced: "Synced",
  fallback: "Saved on this device",
  error: "Could not save preferences",
};

function getStatusIcon(status: PreferenceSyncStatus) {
  if (status === "synced") {
    return <CheckCircle2 className="size-5" />;
  }

  if (status === "fallback" || status === "error") {
    return <CloudOff className="size-5" />;
  }

  return <RefreshCw className="size-5" />;
}

export function PreferenceSyncStatusCard() {
  const [status, setStatus] = useState<PreferenceSyncStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    ensureUserPreferences()
      .then(() => {
        if (isMounted) {
          setStatus("synced");
          setMessage("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("fallback");
          setMessage("Your preferences can still be used on this device.");
        }
      });

    function handleStatusChange(event: Event) {
      const customEvent = event as CustomEvent<PreferenceSyncStatusEventDetail>;
      setStatus(customEvent.detail.status);
      setMessage(customEvent.detail.message ?? "");
    }

    window.addEventListener(
      preferenceSyncStatusEventName,
      handleStatusChange
    );

    return () => {
      isMounted = false;
      window.removeEventListener(
        preferenceSyncStatusEventName,
        handleStatusChange
      );
    };
  }, []);

  const statusIcon = getStatusIcon(status);

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
          {statusIcon}
        </span>
        <div className="mt-3 sm:mt-5">
          <SectionHeader eyebrow="Preferences" title="Synced preferences" />
        </div>
        <p className="text-sm leading-6 text-muted">
          Your training goal, reminders, meal plan, and grocery checklist can
          stay available across devices.
        </p>
      </div>
      <div
        key={status}
        className="liftlog-pop-in rounded-xl bg-white/[0.055] p-3 text-xs shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4 sm:text-sm lg:min-w-64"
      >
        <p className="font-display text-xl font-black">{statusCopy[status]}</p>
        <p className="mt-2 leading-6 text-muted">
          {message || "Preferences stay available while you use LogFit."}
        </p>
      </div>
    </div>
  );
}
