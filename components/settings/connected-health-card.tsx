"use client";

import { SectionHeader } from "@/components/ui/fitness-card";
import {
  deleteImportedHealthData,
  disconnectHealthPlatform,
  emptyHealthSummary,
  fetchHealthSummary,
  formatRelativeTime,
  formatSleep,
  platformLabel,
  type HealthSummary,
} from "@/src/lib/health/queries";
import { HeartPulse, RefreshCw, Smartphone } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function ConnectedHealthCard() {
  const [summary, setSummary] = useState<HealthSummary>(emptyHealthSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorking, setIsWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetchHealthSummary()
      .then(setSummary)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(load, [load]);

  async function handleDisconnect() {
    if (!summary.connection) {
      return;
    }

    setIsWorking(true);
    setMessage("");

    try {
      await disconnectHealthPlatform(summary.connection.platform);
      setMessage("Disconnected. Imported data is kept until you delete it.");
      load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not disconnect."
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDeleteData() {
    const platform = summary.connection?.platform ?? "health_connect";
    setIsWorking(true);
    setMessage("");

    try {
      await deleteImportedHealthData(platform);
      setMessage("Imported health data deleted.");
      load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not delete data."
      );
    } finally {
      setIsWorking(false);
    }
  }

  const { connection, today } = summary;

  return (
    <section id="connected-health" className="lf-panel scroll-mt-4 p-3 sm:p-5">
      <SectionHeader
        eyebrow="Connected health"
        title="Health data"
        action={
          connection ? (
            <button
              type="button"
              onClick={load}
              aria-label="Refresh health status"
              className="lf-press grid size-9 place-items-center rounded-xl border border-line text-muted transition hover:text-foreground"
            >
              <RefreshCw className="size-4" />
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-xl bg-white/[0.05]" />
      ) : connection ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl border border-ready/25 bg-ready/10 text-ready">
                <HeartPulse className="size-5" />
              </span>
              <div>
                <p className="text-sm font-black">
                  {platformLabel(connection.platform)}
                </p>
                <p className="text-xs font-semibold text-ready">Connected</p>
              </div>
            </div>
            <div className="text-right">
              <p className="lf-eyebrow !text-[0.58rem]">Last sync</p>
              <p className="lf-num mt-0.5 text-xs font-bold">
                {formatRelativeTime(connection.last_synced_at)}
              </p>
            </div>
          </div>

          {today ? (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                today.steps != null
                  ? {
                      label: "Steps",
                      value: new Intl.NumberFormat("en").format(today.steps),
                    }
                  : null,
                today.sleep_minutes != null
                  ? { label: "Sleep", value: formatSleep(today.sleep_minutes) }
                  : null,
                today.resting_heart_rate_bpm != null
                  ? {
                      label: "Resting HR",
                      value: `${Math.round(today.resting_heart_rate_bpm)} bpm`,
                    }
                  : null,
                today.active_energy_kcal != null
                  ? {
                      label: "Active energy",
                      value: `${Math.round(today.active_energy_kcal)} kcal`,
                    }
                  : null,
              ]
                .filter(
                  (item): item is { label: string; value: string } =>
                    item !== null
                )
                .map((item) => (
                  <div key={item.label} className="lf-inset p-3">
                    <p className="lf-eyebrow !text-[0.58rem]">{item.label}</p>
                    <p className="lf-num mt-1 font-display text-lg font-black">
                      {item.value}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-line p-3 text-xs font-semibold text-muted">
              No metrics imported for today yet. Open LogFit Mobile and tap
              Sync Now.
            </p>
          )}

          <p className="mt-3 text-[0.68rem] leading-snug text-ink-dim">
            Syncing runs from the LogFit mobile app. Manage granted permissions
            in {platformLabel(connection.platform)} on your phone.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isWorking}
              onClick={handleDisconnect}
              className="lf-press rounded-xl border border-line px-4 py-2.5 text-xs font-bold text-muted transition hover:text-foreground disabled:opacity-50"
            >
              Disconnect
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={handleDeleteData}
              className="lf-press rounded-xl border border-strain/30 px-4 py-2.5 text-xs font-bold text-strain disabled:opacity-50"
            >
              Delete imported data
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted">
            <Smartphone className="size-5" />
          </span>
          <div>
            <p className="text-sm font-bold">No health platform connected</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Install LogFit Mobile and connect Apple Health or Health Connect
              to sync steps, sleep, and more into your Command Centre. LogFit
              works fully without a connection.
            </p>
          </div>
        </div>
      )}

      {message ? (
        <p className="mt-3 rounded-xl border border-line p-3 text-xs font-bold text-muted">
          {message}
        </p>
      ) : null}
    </section>
  );
}
