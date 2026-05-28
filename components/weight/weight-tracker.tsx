"use client";

import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { WeightLogForm } from "@/components/forms/weight-log-form";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import type { WeightLog } from "@/src/lib/supabase/database.types";
import { deleteWeightLog, fetchWeightLogs } from "@/src/lib/weight/queries";
import {
  CalendarDays,
  ClipboardList,
  Pencil,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatWeight(weight: number) {
  return `${weight.toFixed(1)} kg`;
}

function getStats(logs: WeightLog[]) {
  const first = logs[0];
  const latest = logs.at(-1);
  const totalChange =
    first && latest ? latest.weight_kg - first.weight_kg : 0;

  return {
    first,
    latest,
    totalChange,
    count: logs.length,
  };
}

export function WeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshLogs() {
    setError("");

    try {
      const data = await fetchWeightLogs();
      setLogs(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load weight logs."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    fetchWeightLogs()
      .then((data) => {
        if (isMounted) {
          setLogs(data);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load weight logs."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const newestFirstLogs = logs.slice().reverse();
  const stats = getStats(logs);
  const chartData = logs.map((log) => ({
    logged_at: formatDate(log.logged_at),
    weight_kg: log.weight_kg,
  }));

  async function handleSaved(message: string) {
    setNotice(message);
    setEditingLogId(null);
    await refreshLogs();
  }

  async function handleDelete(log: WeightLog) {
    const confirmed = window.confirm(
      `Delete the ${formatDate(log.logged_at)} weight log?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setIsDeleting(log.id);

    try {
      await deleteWeightLog(log.id);
      setNotice("Weight log deleted.");
      await refreshLogs();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this weight log."
      );
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Weight
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Watch the trend, not the noise.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Log real weight check-ins, keep them private to your account, and let
          the trend do the talking.
        </p>
      </section>

      {notice ? (
        <p className="rounded-[1.5rem] border border-line bg-[#eaf3dd] p-4 text-sm font-black text-accent-strong">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Latest weight"
          value={stats.latest ? formatWeight(stats.latest.weight_kg) : "--"}
          detail={
            stats.latest
              ? `Logged ${formatDate(stats.latest.logged_at)}.`
              : "Add your first check-in to start the trend."
          }
          icon={<Scale className="size-5" />}
          tone="teal"
        />
        <MetricCard
          label="First weight"
          value={stats.first ? formatWeight(stats.first.weight_kg) : "--"}
          detail={
            stats.first
              ? `Started ${formatDate(stats.first.logged_at)}.`
              : "No baseline yet."
          }
          icon={<CalendarDays className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Total change"
          value={
            stats.count > 1
              ? `${stats.totalChange > 0 ? "+" : ""}${stats.totalChange.toFixed(
                  1
                )} kg`
              : "--"
          }
          detail={
            stats.count > 1
              ? "Difference from first to latest log."
              : "Needs at least two logs."
          }
          icon={
            stats.totalChange > 0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          tone="ink"
        />
        <MetricCard
          label="Number of logs"
          value={`${stats.count}`}
          detail={
            stats.latest
              ? `Latest date: ${formatDate(stats.latest.logged_at)}.`
              : "Your logbook is still empty."
          }
          icon={<ClipboardList className="size-5" />}
          tone="teal"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Trend" title="Weight over time" />
          {isLoading ? (
            <div className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 text-sm font-black text-muted">
              Loading chart...
            </div>
          ) : logs.length ? (
            <WeightTrendChart data={chartData} />
          ) : (
            <div className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 p-6 text-center">
              <div>
                <p className="font-display text-xl font-black">
                  No weight logs yet.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Add your first log and the chart will wake up.
                </p>
              </div>
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="New log" title="Add a check-in" />
          <WeightLogForm onSaved={handleSaved} />
        </FitnessCard>
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="History" title="Recent entries" />
        {isLoading ? (
          <div className="rounded-[1.5rem] bg-stone-100 p-6 text-sm font-black text-muted">
            Loading weight logs...
          </div>
        ) : newestFirstLogs.length ? (
          <div className="divide-y divide-line">
            {newestFirstLogs.map((log) => {
              const isEditing = editingLogId === log.id;

              return (
                <div key={log.id} className="py-4">
                  {isEditing ? (
                    <div className="rounded-[1.5rem] border border-line bg-white/60 p-4">
                      <WeightLogForm
                        key={log.id}
                        mode="edit"
                        logId={log.id}
                        initialValues={{
                          logged_at: log.logged_at,
                          weight_kg: log.weight_kg,
                          notes: log.notes ?? "",
                        }}
                        onCancel={() => setEditingLogId(null)}
                        onSaved={handleSaved}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-display text-xl font-black">
                          {formatWeight(log.weight_kg)}
                        </p>
                        <p className="mt-1 text-sm font-bold text-muted">
                          {formatDate(log.logged_at)}
                        </p>
                        {log.notes ? (
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {log.notes}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNotice("");
                            setEditingLogId(log.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/70 px-4 py-2 text-sm font-black text-muted transition hover:-translate-y-0.5 hover:text-foreground"
                        >
                          <Pencil className="size-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(log)}
                          disabled={isDeleting === log.id}
                          className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Trash2 className="size-4" />
                          {isDeleting === log.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.5rem] bg-[#eaf3dd] p-6">
            <p className="font-display text-xl font-black">
              Your weight log is empty.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Add a check-in above. One dot today, a trend tomorrow. Tiny data
              goblin, very helpful.
            </p>
          </div>
        )}
      </FitnessCard>
    </div>
  );
}
