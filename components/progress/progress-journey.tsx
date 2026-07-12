"use client";

import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { getDateDaysAgo } from "@/src/lib/habits/queries";
import {
  buildJourneySummary,
  buildMilestones,
  buildStrengthTrends,
  calculateBestStreak,
  type JourneySummary,
  type Milestone,
  type StrengthTrend,
} from "@/src/lib/performance/journey";
import {
  fetchDatedExercises,
  type DatedExercise,
} from "@/src/lib/performance/muscles";
import {
  estimateOneRepMax,
  normalizeExerciseName,
} from "@/src/lib/performance/history";
import { fetchWeightLogs } from "@/src/lib/weight/queries";
import type { WeightLog, Workout } from "@/src/lib/supabase/database.types";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  Award,
  Dumbbell,
  Flag,
  Flame,
  Gauge,
  MapPin,
  Scale,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProgressTab = "journey" | "weight" | "strength" | "consistency";

const milestoneIcons = {
  start: Flag,
  weight: Scale,
  workouts: Dumbbell,
  strength: Award,
  streak: Flame,
  current: MapPin,
} as const;

const coreLifts = ["Bench press", "Back squat", "Deadlift", "Overhead press"];

function StrengthLab({ trends }: { trends: StrengthTrend[] }) {
  const trackedBench = trends.find((trend) =>
    normalizeExerciseName(trend.exerciseName).includes("bench")
  );
  const initialLift = trackedBench?.exerciseName ?? trends[0]?.exerciseName ?? coreLifts[0];
  const [selectedLift, setSelectedLift] = useState(initialLift);
  const [weight, setWeight] = useState("80");
  const [reps, setReps] = useState("5");
  const liftOptions = useMemo(
    () =>
      Array.from(
        new Set([...coreLifts, ...trends.map((trend) => trend.exerciseName)])
      ),
    [trends]
  );
  const selectedTrend = trends.find(
    (trend) =>
      normalizeExerciseName(trend.exerciseName) ===
      normalizeExerciseName(selectedLift)
  );
  const estimate = estimateOneRepMax(Number(weight), Number(reps));

  function chooseCoreLift(keyword: string, fallback: string) {
    const tracked = trends.find((trend) =>
      normalizeExerciseName(trend.exerciseName).includes(keyword)
    );
    setSelectedLift(tracked?.exerciseName ?? fallback);
  }

  return (
    <section className="lf-rise lf-panel relative min-w-0 overflow-hidden p-3 sm:p-5">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_28px_rgba(240,71,46,0.28)]">
              <Gauge className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="lf-eyebrow">Strength lab</p>
              <h2 className="mt-0.5 font-display text-lg font-black tracking-tight sm:text-xl">
                Track your estimated 1-rep max
              </h2>
            </div>
          </div>
          <Calculator className="hidden size-5 shrink-0 text-ink-dim sm:block" />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          <button
            type="button"
            onClick={() => chooseCoreLift("bench", "Bench press")}
            className="lf-press min-h-9 rounded-lg border border-line bg-white/[0.03] px-2 text-xs font-black text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            Bench
          </button>
          <button
            type="button"
            onClick={() => chooseCoreLift("squat", "Back squat")}
            className="lf-press min-h-9 rounded-lg border border-line bg-white/[0.03] px-2 text-xs font-black text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            Squat
          </button>
          <button
            type="button"
            onClick={() => chooseCoreLift("deadlift", "Deadlift")}
            className="lf-press min-h-9 rounded-lg border border-line bg-white/[0.03] px-2 text-xs font-black text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            Deadlift
          </button>
        </div>

        <label className="mt-3 block">
          <span className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink-dim">
            Lift to inspect
          </span>
          <select
            value={selectedLift}
            onChange={(event) => setSelectedLift(event.target.value)}
            className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-sm font-black outline-none transition focus:border-accent sm:max-w-md"
          >
            {liftOptions.map((lift) => (
              <option key={lift} value={lift}>
                {lift}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.55rem]">Current</p>
            <p className="lf-num mt-1 truncate font-display text-xl font-black">
              {selectedTrend ? `${selectedTrend.lastOneRepMax.toFixed(0)}` : "—"}
            </p>
            <p className="text-[0.62rem] font-bold text-muted">kg est. 1RM</p>
          </div>
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.55rem]">Best</p>
            <p className="lf-num mt-1 truncate font-display text-xl font-black text-ready">
              {selectedTrend ? `${selectedTrend.bestOneRepMax.toFixed(0)}` : "—"}
            </p>
            <p className="text-[0.62rem] font-bold text-muted">kg tracked</p>
          </div>
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.55rem]">Change</p>
            <p className="lf-num mt-1 truncate font-display text-xl font-black text-accent-strong">
              {selectedTrend
                ? `${selectedTrend.changePercent > 0 ? "+" : ""}${selectedTrend.changePercent}%`
                : "—"}
            </p>
            <p className="text-[0.62rem] font-bold text-muted">
              {selectedTrend ? `${selectedTrend.sessions} sessions` : "No history"}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/15 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black">Estimate a new max</p>
              <p className="mt-0.5 text-[0.65rem] text-muted">
                Enter a recent working set.
              </p>
            </div>
            <p className="lf-num text-right font-display text-2xl font-black text-accent-strong">
              {estimate ? `${estimate.toFixed(0)} kg` : "—"}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="min-w-0">
              <span className="text-[0.6rem] font-black uppercase tracking-wider text-ink-dim">
                Weight, kg
              </span>
              <input
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                className="lf-num mt-1 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-lg font-black outline-none focus:border-accent"
              />
            </label>
            <label className="min-w-0">
              <span className="text-[0.6rem] font-black uppercase tracking-wider text-ink-dim">
                Reps
              </span>
              <input
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                step="1"
                className="lf-num mt-1 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-lg font-black outline-none focus:border-accent"
              />
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.65rem] leading-4 text-ink-dim">
            Estimates use your logged weight and reps; they are a training guide, not a testing requirement.
          </p>
          <Link
            href={`/workouts/new?exercise=${encodeURIComponent(selectedLift)}`}
            className="lf-press inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-white transition hover:bg-accent-strong"
          >
            Log {selectedLift}
          </Link>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

type ProgressData = {
  weights: WeightLog[];
  workouts: Workout[];
  exercises: DatedExercise[];
};

export function ProgressJourney() {
  const [tab, setTab] = useState<ProgressTab>("journey");
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchWeightLogs(), fetchDatedExercises(365)])
      .then(([weights, dated]) => {
        if (isMounted) {
          setData({
            weights,
            workouts: dated.workouts,
            exercises: dated.exercises,
          });
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load progress data."
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

  const derived = useMemo(() => {
    if (!data) {
      return null;
    }

    const activeDates = data.workouts.map((workout) => workout.workout_date);
    const bestStreak = calculateBestStreak(activeDates);
    const firstDate = [
      ...data.weights.map((log) => log.logged_at),
      ...activeDates,
    ].sort()[0];
    const todayTime = new Date(
      `${getDateDaysAgo(0)}T00:00:00`
    ).getTime();
    const daysTracked = firstDate
      ? Math.max(
          1,
          Math.round(
            (todayTime - new Date(`${firstDate}T00:00:00`).getTime()) /
              86_400_000
          )
        )
      : 0;

    const summary: JourneySummary = buildJourneySummary({
      weights: data.weights,
      workouts: data.workouts,
      exercises: data.exercises,
      activeDays: new Set(activeDates).size,
      daysTracked,
    });

    const milestones: Milestone[] = buildMilestones({
      weights: data.weights,
      workouts: data.workouts,
      exercises: data.exercises,
      bestStreak,
    });

    const trends: StrengthTrend[] = buildStrengthTrends(data.exercises);

    // Active days per week, last 8 weeks.
    const weeks = Array.from({ length: 8 }, (_item, index) => {
      const start = getDateDaysAgo((7 - index) * 7 + 6);
      const end = getDateDaysAgo((7 - index) * 7);
      const days = new Set(
        activeDates.filter((date) => date >= start && date <= end)
      ).size;

      return { start, days };
    });

    return { summary, milestones, trends, bestStreak, weeks };
  }, [data]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-24 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
        <div className="h-72 animate-pulse rounded-[1.25rem] bg-white/[0.045]" />
      </div>
    );
  }

  if (error || !data || !derived) {
    return (
      <p className="lf-panel mx-auto max-w-4xl p-5 text-sm font-bold text-strain">
        {error || "Could not load progress data."}
      </p>
    );
  }

  const { summary, milestones, trends, bestStreak, weeks } = derived;
  const hasAnything = data.weights.length > 0 || data.workouts.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <header className="lf-rise">
        <p className="lf-eyebrow">Progress</p>
        <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
          Your journey
        </h1>
      </header>

      {!hasAnything ? (
        <div className="lf-panel p-6 text-center">
          <p className="font-display text-lg font-black">
            Your story starts with one log
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Weight check-ins and workouts build this timeline automatically.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Link
              href="/weight"
              className="lf-press rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white transition hover:bg-accent-strong"
            >
              Log weight
            </Link>
            <Link
              href="/workouts/live"
              className="lf-press rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-muted transition hover:text-foreground"
            >
              Start training
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Headline stats */}
          <section className="lf-rise lf-rise-1 grid grid-cols-3 gap-2">
            <div className="lf-panel p-3 text-center sm:p-4">
              <p
                className={`lf-num flex items-center justify-center gap-1 font-display text-xl font-black sm:text-2xl ${
                  summary.weightDirection === "down"
                    ? "text-ready"
                    : summary.weightDirection === "up"
                      ? "text-caution"
                      : ""
                }`}
              >
                {summary.weightChangeKg !== null ? (
                  <>
                    {summary.weightDirection === "down" ? (
                      <ArrowDownRight className="size-4" />
                    ) : summary.weightDirection === "up" ? (
                      <ArrowUpRight className="size-4" />
                    ) : null}
                    {Math.abs(summary.weightChangeKg).toFixed(1)} kg
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p className="lf-eyebrow mt-1 !text-[0.58rem]">
                {summary.weightDirection === "up" ? "Gained" : "Lost"}
              </p>
            </div>
            <div className="lf-panel p-3 text-center sm:p-4">
              <p className="lf-num font-display text-xl font-black sm:text-2xl">
                {summary.strongestImprovement &&
                summary.strongestImprovement.changePercent > 0
                  ? `+${summary.strongestImprovement.changePercent}%`
                  : summary.totalWorkouts}
              </p>
              <p className="lf-eyebrow mt-1 !text-[0.58rem]">
                {summary.strongestImprovement &&
                summary.strongestImprovement.changePercent > 0
                  ? "Stronger"
                  : "Workouts"}
              </p>
            </div>
            <div className="lf-panel p-3 text-center sm:p-4">
              <p className="lf-num font-display text-xl font-black sm:text-2xl">
                {summary.consistencyPercent}%
              </p>
              <p className="lf-eyebrow mt-1 !text-[0.58rem]">Consistency</p>
            </div>
          </section>

          <StrengthLab trends={trends} />

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Progress views"
            className="lf-rise lf-rise-2 grid grid-cols-4 gap-1 rounded-xl border border-line bg-surface p-1"
          >
            {(
              [
                ["journey", "Journey"],
                ["weight", "Weight"],
                ["strength", "Strength"],
                ["consistency", "Rhythm"],
              ] as Array<[ProgressTab, string]>
            ).map(([id, label]) => (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`lf-press rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
                  tab === id
                    ? "bg-white/[0.09] text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "journey" ? (
            <section className="lf-fade lf-panel p-4 sm:p-5">
              {milestones.length ? (
                <ol className="relative space-y-0">
                  {milestones.map((milestone, index) => {
                    const Icon = milestoneIcons[milestone.kind];
                    const isLast = index === milestones.length - 1;

                    return (
                      <li
                        key={`${milestone.date}-${milestone.title}`}
                        className="relative flex gap-3 pb-5 last:pb-0"
                      >
                        {!isLast ? (
                          <span className="absolute left-[0.9rem] top-8 h-[calc(100%-1.6rem)] w-px bg-line" />
                        ) : null}
                        <span
                          className={`grid size-[1.85rem] shrink-0 place-items-center rounded-full border ${
                            milestone.kind === "current"
                              ? "border-accent/50 bg-accent/15 text-accent-strong"
                              : milestone.kind === "strength"
                                ? "border-ready/30 bg-ready/10 text-ready"
                                : "border-line bg-white/[0.05] text-muted"
                          }`}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-ink-dim">
                            {formatDate(milestone.date)}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
                            <span className="lf-num font-display text-lg font-black leading-tight">
                              {milestone.value}
                            </span>
                            <span className="text-sm font-bold text-muted">
                              {milestone.title}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-ink-dim">
                            {milestone.detail}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="text-sm text-muted">
                  Milestones appear as your logs accumulate.
                </p>
              )}
            </section>
          ) : null}

          {tab === "weight" ? (
            <section className="lf-fade lf-panel p-4 sm:p-5">
              {data.weights.length ? (
                <WeightTrendChart data={data.weights} />
              ) : (
                <p className="py-6 text-center text-sm text-muted">
                  No weight logs yet.{" "}
                  <Link href="/weight" className="font-bold text-accent-strong">
                    Add your first →
                  </Link>
                </p>
              )}
              <div className="mt-2 flex justify-end">
                <Link
                  href="/weight"
                  className="text-xs font-bold text-muted transition hover:text-foreground"
                >
                  Manage weight logs →
                </Link>
              </div>
            </section>
          ) : null}

          {tab === "strength" ? (
            <section className="lf-fade space-y-2">
              {trends.length ? (
                trends.slice(0, 8).map((trend) => (
                  <div key={trend.exerciseName} className="lf-inset p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-bold">
                        {trend.exerciseName}
                      </p>
                      <p
                        className={`lf-num flex shrink-0 items-center gap-0.5 text-sm font-black ${
                          trend.changePercent > 0
                            ? "text-ready"
                            : trend.changePercent < 0
                              ? "text-caution"
                              : "text-muted"
                        }`}
                      >
                        {trend.changePercent > 0 ? (
                          <TrendingUp className="size-3.5" />
                        ) : null}
                        {trend.changePercent > 0 ? "+" : ""}
                        {trend.changePercent}%
                      </p>
                    </div>
                    <p className="lf-num mt-1 text-xs font-semibold text-muted">
                      Est. 1RM {trend.firstOneRepMax.toFixed(0)} →{" "}
                      {trend.lastOneRepMax.toFixed(0)} kg · best{" "}
                      {trend.bestOneRepMax.toFixed(0)} kg · {trend.sessions}{" "}
                      sessions
                    </p>
                  </div>
                ))
              ) : (
                <p className="lf-panel p-5 text-center text-sm text-muted">
                  Log the same lifts with weight and reps over multiple sessions
                  to unlock strength trends.
                </p>
              )}
            </section>
          ) : null}

          {tab === "consistency" ? (
            <section className="lf-fade lf-panel p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="lf-inset p-3">
                  <p className="lf-eyebrow !text-[0.6rem]">Best streak</p>
                  <p className="lf-num mt-1 font-display text-2xl font-black">
                    {bestStreak}{" "}
                    <span className="text-sm font-bold text-muted">days</span>
                  </p>
                </div>
                <div className="lf-inset p-3">
                  <p className="lf-eyebrow !text-[0.6rem]">Total sessions</p>
                  <p className="lf-num mt-1 font-display text-2xl font-black">
                    {summary.totalWorkouts}
                  </p>
                </div>
              </div>
              <p className="lf-eyebrow mt-4 !text-[0.6rem]">
                Active days per week · last 8 weeks
              </p>
              <div className="mt-2 flex h-24 items-end gap-1.5">
                {weeks.map((week) => (
                  <div
                    key={week.start}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <div
                      className={`w-full rounded-t-md ${week.days >= 3 ? "bg-accent" : week.days > 0 ? "bg-accent/45" : "bg-white/[0.06]"}`}
                      style={{
                        height: `${Math.max(6, (week.days / 7) * 100)}%`,
                      }}
                      title={`${week.days} active days`}
                    />
                    <span className="lf-num text-[0.6rem] font-bold text-ink-dim">
                      {week.days}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
