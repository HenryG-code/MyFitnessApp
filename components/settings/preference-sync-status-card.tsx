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
  error: "Could not sync preferences",
};

function getStatusIcon(status: PreferenceSyncStatus) {
  if (status === "synced") {
    return CheckCircle2;
  }

  if (status === "fallback" || status === "error") {
    return CloudOff;
  }

  return RefreshCw;
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

  const Icon = getStatusIcon(status);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-2xl">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-stone-950">
          <Icon className="size-5" />
        </span>
        <div className="mt-5">
          <SectionHeader eyebrow="Preferences" title="Synced preferences" />
        </div>
        <p className="text-sm leading-6 text-muted">
          Your training goal, reminder settings, meal plan, and grocery
          checklist can sync with your account.
        </p>
      </div>
      <div className="rounded-[1.25rem] border border-line bg-white/65 p-4 text-sm lg:min-w-64">
        <p className="font-display text-xl font-black">{statusCopy[status]}</p>
        <p className="mt-2 leading-6 text-muted">
          {message || "Preferences stay available while you use LiftLog."}
        </p>
      </div>
    </div>
  );
}
