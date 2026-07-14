"use client";

import { WeightTrendChart } from "@/components/charts/weight-trend-chart";
import { getDateDaysAgo } from "@/src/lib/habits/queries";
import {
  buildJourneySummary,
  buildMilestones,
  buildStrengthTrends,
  calculateBestStreak,
  ONE_REP_MAX_LIFTS,
  suggestNextOneRepMax,
  type JourneySummary,
  type Milestone,
  type OneRepMaxLiftId,
  type StrengthTrend,
} from "@/src/lib/performance/journey";
import {
  fetchDatedExercises,
  type DatedExercise,
} from "@/src/lib/performance/muscles";
import { fetchWeightLogs } from "@/src/lib/weight/queries";
import type { WeightLog, Workout } from "@/src/lib/supabase/database.types";
import {
  ArrowDownRight,
  ArrowUp,
  ArrowUpRight,
  Calculator,
  Award,
  Dumbbell,
  Flag,
  Flame,
  Gauge,
  MapPin,
  PersonStanding,
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

const oneRepMaxIcons: Record<OneRepMaxLiftId, typeof Dumbbell> = {
  "bench-press": Dumbbell,
  "back-squat": PersonStanding,
  deadlift: TrendingUp,
  "overhead-press": ArrowUp,
};

function StrengthLab({ trends }: { trends: StrengthTrend[] }) {
  const initialLift =
    trends.find((trend) => trend.liftId === "bench-press")?.liftId ??
    trends[0]?.liftId ??
    ONE_REP_MAX_LIFTS[0].id;
  const [selectedLift, setSelectedLift] =
    useState<OneRepMaxLiftId>(initialLift);
  const [weight, setWeight] = useState("80");
  const [reps, setReps] = useState("5");
  const selectedTrend = trends.find((trend) => trend.liftId === selectedLift);
  const selectedDefinition =
    ONE_REP_MAX_LIFTS.find((lift) => lift.id === selectedLift) ??
    ONE_REP_MAX_LIFTS[0];
  const nextTarget = suggestNextOneRepMax({
    workingWeight: Number(weight),
    reps: reps === "" ? null : Number(reps),
  });
  const formatMax = (value: number) =>
    value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);

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
              <p className="lf-eyebrow">Strength lab · 4 lifts</p>
              <h2 className="mt-0.5 font-display text-lg font-black tracking-tight sm:text-xl">
                One-rep max tracker
              </h2>
            </div>
          </div>
          <Calculator className="hidden size-5 shrink-0 text-ink-dim sm:block" />
        </div>

        <div
          className="mt-3 grid min-w-0 grid-cols-4 gap-1 rounded-xl border border-line bg-black/15 p-1"
          aria-label="Tracked one-rep max lift"
        >
          {ONE_REP_MAX_LIFTS.map((lift) => {
            const LiftIcon = oneRepMaxIcons[lift.id];
            const isSelected = selectedLift === lift.id;

            return (
              <button
                key={lift.id}
                type="button"
                title={lift.name}
                aria-label={lift.name}
                aria-pressed={isSelected}
                onClick={() => setSelectedLift(lift.id)}
                className={`lf-press flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[0.62rem] font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  isSelected
                    ? "bg-accent text-white shadow-[0_6px_18px_rgba(240,71,46,0.28)]"
                    : "text-muted hover:bg-white/[0.05] hover:text-foreground"
                }`}
              >
                <LiftIcon className="size-3.5" />
                <span className="max-w-full truncate">{lift.shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-white/[0.025]">
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="lf-eyebrow !text-[0.54rem]">Current</p>
            <p className="lf-num mt-0.5 truncate font-display text-xl font-black">
              {selectedTrend ? formatMax(selectedTrend.lastOneRepMax) : "—"}
              {selectedTrend ? (
                <span className="ml-0.5 text-[0.58rem] text-muted">kg</span>
              ) : null}
            </p>
          </div>
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="lf-eyebrow !text-[0.54rem]">Best</p>
            <p className="lf-num mt-0.5 truncate font-display text-xl font-black text-ready">
              {selectedTrend ? formatMax(selectedTrend.bestOneRepMax) : "—"}
              {selectedTrend ? (
                <span className="ml-0.5 text-[0.58rem] text-muted">kg</span>
              ) : null}
            </p>
          </div>
          <div className="min-w-0 px-2 py-2.5 text-center">
            <p className="lf-eyebrow !text-[0.54rem]">Progress</p>
            <p className="lf-num mt-0.5 truncate font-display text-xl font-black text-accent-strong">
              {selectedTrend
                ? `${selectedTrend.changePercent > 0 ? "+" : ""}${selectedTrend.changePercent}%`
                : "—"}
            </p>
            <p className="truncate text-[0.55rem] font-bold text-muted">
              {selectedTrend ? `${selectedTrend.sessions} logs` : "No history"}
            </p>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.14] via-white/[0.035] to-transparent p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="lf-eyebrow text-accent-strong">Working set → 1RM</p>
              <p className="mt-0.5 truncate text-xs font-black">
                {selectedDefinition.name} estimate
              </p>
            </div>
            <div className="shrink-0 text-right" aria-live="polite">
              <p className="lf-num font-display text-3xl font-black leading-none text-accent-strong">
                {nextTarget !== null ? formatMax(nextTarget) : "—"}
                {nextTarget !== null ? (
                  <span className="ml-1 text-xs text-muted">kg</span>
                ) : null}
              </p>
              <p className="mt-1 text-[0.54rem] font-black uppercase tracking-[0.14em] text-ink-dim">
                projected max
              </p>
            </div>
          </div>

          <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
            <label className="min-w-0 rounded-xl border border-line bg-black/20 px-3 py-2 transition focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/25">
              <span className="block text-[0.56rem] font-black uppercase tracking-wider text-ink-dim">
                Weight
              </span>
              <span className="flex min-w-0 items-baseline gap-1">
                <input
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.5"
                  className="lf-num h-7 w-full min-w-0 bg-transparent text-xl font-black outline-none"
                />
                <span className="text-[0.62rem] font-black text-muted">kg</span>
              </span>
            </label>
            <label className="min-w-0 rounded-xl border border-line bg-black/20 px-3 py-2 transition focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/25">
              <span className="block text-[0.56rem] font-black uppercase tracking-wider text-ink-dim">
                Clean reps
              </span>
              <input
                value={reps}
                onChange={(event) => setReps(event.target.value)}
                type="number"
                inputMode="numeric"
                min="1"
                max="12"
                step="1"
                className="lf-num h-7 w-full min-w-0 bg-transparent text-xl font-black outline-none"
              />
            </label>
          </div>

          <div className="mt-2 flex min-w-0 items-center gap-2">
            <p className="min-w-0 flex-1 text-[0.61rem] leading-4 text-muted">
              {nextTarget !== null
                ? `${weight} kg × ${reps} clean reps projects ${formatMax(nextTarget)} kg.`
                : "Enter a completed set of 1–12 clean reps."}
            </p>
            <Link
              href={`/workouts/new?exercise=${encodeURIComponent(selectedDefinition.name)}`}
              aria-label={`Log ${selectedDefinition.name}`}
              className="lf-press inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-accent px-3 text-xs font-black text-white transition hover:bg-accent-strong"
            >
              Log lift
            </Link>
          </div>
        </div>

        <p className="mt-2 text-center text-[0.58rem] leading-4 text-ink-dim">
          Estimates are guidance. Warm up fully and use safety arms or a spotter.
        </p>
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
