"use client";

import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { WeightLogForm } from "@/components/forms/weight-log-form";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { GoalWeightForm } from "@/components/weight/goal-weight-form";
import { QuickWeightLog } from "@/components/weight/quick-weight-log";
import { fetchAuthenticatedProfile } from "@/src/lib/profile/queries";
import type { WeightLog } from "@/src/lib/supabase/database.types";
import { deleteWeightLog, fetchWeightLogs } from "@/src/lib/weight/queries";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
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

export function WeightTracker() {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  async function refreshLogs() {
    setError("");

    try {
      setLogs(await fetchWeightLogs());
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
      .then((data) => isMounted && setLogs(data))
      .catch(
        (loadError: unknown) =>
          isMounted &&
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load weight logs."
          )
      )
      .finally(() => isMounted && setIsLoading(false));

    fetchAuthenticatedProfile()
      .then(
        (profile) =>
          isMounted && setGoalWeight(profile.profile?.goal_weight_kg ?? null)
      )
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  const newestFirstLogs = logs.slice().reverse();
  const first = logs[0];
  const latest = logs.at(-1) ?? null;
  const totalChange = first && latest ? latest.weight_kg - first.weight_kg : null;
  const distanceToGoal =
    latest && goalWeight !== null ? latest.weight_kg - goalWeight : null;
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
    if (
      !window.confirm(`Delete the ${formatDate(log.logged_at)} weight log?`)
    ) {
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
    <div className="mx-auto max-w-4xl space-y-3">
      {/* Compact header */}
      <header className="lf-rise flex items-end justify-between gap-3">
        <div>
          <p className="lf-eyebrow">Weight</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            Watch the trend
          </h1>
        </div>
        {latest ? (
          <p className="text-right">
            <span className="lf-num block font-display text-xl font-black">
              {formatWeight(latest.weight_kg)}
            </span>
            <span className="text-[0.65rem] font-bold text-ink-dim">
              {formatDate(latest.logged_at)}
            </span>
          </p>
        ) : null}
      </header>

      {(notice || error) && (
        <p
          role="status"
          className={`rounded-xl border p-3 text-xs font-bold ${
            error
              ? "border-strain/30 bg-strain/10 text-strain"
              : "border-ready/25 bg-ready/10 text-ready"
          }`}
        >
          {error || notice}
        </p>
      )}

      {/* Quick log — the primary daily action, above the fold */}
      <div className="lf-rise lf-rise-1">
        <QuickWeightLog latestLog={latest} onSaved={handleSaved} />
        <div className="mt-1.5 flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShowMoreOptions((current) => !current)}
            aria-expanded={showMoreOptions}
            className="lf-press flex items-center gap-1 py-1.5 text-xs font-bold text-muted transition hover:text-foreground"
          >
            Backdate or add notes
            <ChevronDown
              className={`size-3.5 transition-transform ${showMoreOptions ? "rotate-180" : ""}`}
            />
          </button>
          <button
            type="button"
            onClick={() => setShowGoalForm((current) => !current)}
            aria-expanded={showGoalForm}
            className="lf-press py-1.5 text-xs font-bold text-muted transition hover:text-foreground"
          >
            {goalWeight !== null
              ? `Goal: ${formatWeight(goalWeight)}`
              : "Set goal weight"}
          </button>
        </div>
        {showMoreOptions ? (
          <div className="lf-fade lf-panel mt-1.5 p-4">
            <WeightLogForm onSaved={handleSaved} />
          </div>
        ) : null}
        {showGoalForm ? (
          <div className="lf-fade lf-panel mt-1.5 p-4">
            <GoalWeightForm
              initialGoalWeight={goalWeight}
              onSaved={(savedProfile) => {
                setGoalWeight(savedProfile.goal_weight_kg);
                setShowGoalForm(false);
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Stat strip */}
      <section className="lf-rise lf-rise-2 grid grid-cols-3 gap-2">
        <div className="lf-inset p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Goal</p>
          <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
            {goalWeight !== null ? goalWeight.toFixed(1) : "—"}
          </p>
        </div>
        <div className="lf-inset p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">
            To goal
          </p>
          <p
            className={`lf-num mt-1 font-display text-base font-black sm:text-xl ${
              distanceToGoal !== null && Math.abs(distanceToGoal) < 0.05
                ? "text-ready"
                : ""
            }`}
          >
            {distanceToGoal !== null
              ? `${distanceToGoal > 0 ? "+" : ""}${distanceToGoal.toFixed(1)}`
              : "—"}
          </p>
        </div>
        <div className="lf-inset p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">
            Total change
          </p>
          <p
            className={`lf-num mt-1 font-display text-base font-black sm:text-xl ${
              totalChange !== null && totalChange < -0.05 ? "text-ready" : ""
            }`}
          >
            {totalChange !== null
              ? `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)}`
              : "—"}
          </p>
        </div>
      </section>

      {/* Chart */}
      <FitnessCard className="lf-rise lf-rise-3">
        <SectionHeader eyebrow="Trend" title="Weight over time" />
        {isLoading ? (
          <div className="h-[16rem] animate-pulse rounded-xl bg-white/[0.05]" />
        ) : logs.length > 1 ? (
          <WeightTrendChart data={chartData} />
        ) : (
          <div className="grid h-40 place-items-center rounded-xl border border-dashed border-line p-4 text-center">
            <p className="text-sm font-semibold text-muted">
              {logs.length === 1
                ? "One check-in logged — add another to draw the trend."
                : "Log your first weigh-in above to start the trend."}
            </p>
          </div>
        )}
      </FitnessCard>

      {/* History */}
      <FitnessCard className="lf-rise lf-rise-4">
        <SectionHeader eyebrow="History" title="Recent entries" />
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-white/[0.05]" />
        ) : newestFirstLogs.length ? (
          <div className="divide-y divide-line">
            {newestFirstLogs.map((log, index) => {
              const previous = newestFirstLogs[index + 1];
              const delta = previous
                ? Math.round((log.weight_kg - previous.weight_kg) * 10) / 10
                : null;

              return editingLogId === log.id ? (
                <div key={log.id} className="py-3">
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
                <div
                  key={log.id}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="flex items-baseline gap-2">
                      <span className="lf-num font-display text-base font-black">
                        {formatWeight(log.weight_kg)}
                      </span>
                      {delta !== null && delta !== 0 ? (
                        <span
                          className={`lf-num text-[0.65rem] font-bold ${
                            delta < 0 ? "text-ready" : "text-caution"
                          }`}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(1)}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[0.7rem] font-semibold text-ink-dim">
                      {formatDate(log.logged_at)}
                      {log.notes ? ` · ${log.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNotice("");
                        setEditingLogId(log.id);
                      }}
                      aria-label={`Edit ${formatDate(log.logged_at)} entry`}
                      className="lf-press grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:text-foreground"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(log)}
                      disabled={isDeleting === log.id}
                      aria-label={`Delete ${formatDate(log.logged_at)} entry`}
                      className="lf-press grid size-9 place-items-center rounded-lg border border-strain/25 text-strain transition disabled:opacity-50"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line p-4 text-sm font-semibold text-muted">
            Your weight log is empty. One entry today becomes a clearer trend
            over time.
          </p>
        )}
      </FitnessCard>
    </div>
  );
}
