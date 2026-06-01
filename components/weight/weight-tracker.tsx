"use client";

import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { WeightLogForm } from "@/components/forms/weight-log-form";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import { GoalWeightForm } from "@/components/weight/goal-weight-form";
import { fetchAuthenticatedProfile } from "@/src/lib/profile/queries";
import type { WeightLog } from "@/src/lib/supabase/database.types";
import { deleteWeightLog, fetchWeightLogs } from "@/src/lib/weight/queries";
import {
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
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
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

    fetchAuthenticatedProfile()
      .then((profile) => {
        if (isMounted) {
          setGoalWeight(profile.profile?.goal_weight_kg ?? null);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load goal weight."
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const newestFirstLogs = logs.slice().reverse();
  const stats = getStats(logs);
  const distanceToGoal =
    stats.latest && goalWeight !== null ? stats.latest.weight_kg - goalWeight : null;
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
        <p className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-4 text-sm font-black text-soft-yellow">
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
          tone="yellow"
        />
        <MetricCard
          label="Goal weight"
          value={goalWeight !== null ? formatWeight(goalWeight) : "--"}
          detail={
            goalWeight !== null
              ? "Managed from this Weight page."
              : "Set a goal to track distance."
          }
          icon={<Scale className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Distance to goal"
          value={
            distanceToGoal !== null
              ? `${distanceToGoal > 0 ? "+" : ""}${distanceToGoal.toFixed(1)} kg`
              : "--"
          }
          detail={
            distanceToGoal !== null
              ? Math.abs(distanceToGoal) < 0.05
                ? "Goal reached based on your latest log."
                : "Based on your latest check-in."
              : "Add a latest weight and goal."
          }
          icon={
            distanceToGoal !== null && distanceToGoal > 0 ? (
              <TrendingUp className="size-5" />
            ) : (
              <TrendingDown className="size-5" />
            )
          }
          tone="ink"
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
              ? `${stats.count} logs from first to latest.`
              : "Needs at least two logs."
          }
          icon={<ClipboardList className="size-5" />}
          tone="yellow"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Trend" title="Weight over time" />
          {isLoading ? (
            <div className="grid h-[18rem] place-items-center rounded-[1.5rem] bg-surface/80 text-sm font-black text-muted sm:h-[20rem] lg:h-[24rem]">
              Loading chart...
            </div>
          ) : logs.length > 1 ? (
            <WeightTrendChart data={chartData} />
          ) : (
            <div className="grid h-[18rem] place-items-center rounded-[1.5rem] border border-line bg-surface/80 p-6 text-center sm:h-[20rem] lg:h-[24rem]">
              <div>
                <p className="font-display text-xl font-black">
                  {logs.length === 1
                    ? "One check-in logged."
                    : "No weight logs yet."}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Add more weight check-ins to see your trend.
                </p>
              </div>
            </div>
          )}
        </FitnessCard>

        <div className="space-y-5">
          <FitnessCard>
            <SectionHeader eyebrow="Goal" title="Set your target" />
            <GoalWeightForm
              initialGoalWeight={goalWeight}
              onSaved={(savedProfile) =>
                setGoalWeight(savedProfile.goal_weight_kg)
              }
            />
          </FitnessCard>

          <FitnessCard>
            <SectionHeader eyebrow="New log" title="Add a check-in" />
            <WeightLogForm onSaved={handleSaved} />
          </FitnessCard>
        </div>
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
          <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-6">
            <p className="font-display text-xl font-black">
              Your weight log is empty.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Add a check-in above. One entry today becomes a clearer trend
              over time.
            </p>
          </div>
        )}
      </FitnessCard>
    </div>
  );
}
