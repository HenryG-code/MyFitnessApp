"use client";

import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import {
  buildWeeklyConsistencyData,
  calculateMacroBreakdown,
  calculateTodayMacros,
  calculateWeeklyMacros,
  calculateWeeklyWorkoutStats,
  calculateWeightProgress,
  fetchDashboardData,
  generateProgressInsights,
  type DashboardData,
} from "@/src/lib/dashboard/queries";
import {
  hasPlannedMeals,
  loadMealPlanFromStorage,
} from "@/src/lib/meal-planner/storage";
import { getDateInputValue } from "@/src/lib/habits/queries";
import {
  emptyHealthSummary,
  fetchHealthSummary,
  formatSleep,
  platformLabel,
  type HealthSummary,
} from "@/src/lib/health/queries";
import { buildTodayMission } from "@/src/lib/performance/mission";
import {
  calculateReadiness,
  calculateTrainingStreak,
  classifyWeeklyLoad,
  type Readiness,
} from "@/src/lib/performance/readiness";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Flame,
  Play,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const readinessColors = {
  primed: "var(--accent)",
  ready: "var(--ready)",
  steady: "var(--caution)",
  recover: "var(--strain)",
} as const;

function ReadinessRing({ readiness }: { readiness: Readiness }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - readiness.score / 100);
  const color = readinessColors[readiness.state];

  return (
    <div className="relative size-[7.25rem] shrink-0" role="img" aria-label={`Readiness ${readiness.score} out of 100 — ${readiness.headline}`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="8"
        />
        <circle
          className="lf-ring-arc"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ "--lf-ring-start": circumference } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="lf-num font-display text-[2.35rem] font-black leading-none">
            {readiness.score}
          </p>
          <p className="lf-eyebrow mt-1 !text-[0.56rem]">Readiness</p>
        </div>
      </div>
    </div>
  );
}

function TrendArrow({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "flat") {
    return null;
  }

  return direction === "down" ? (
    <ArrowDownRight className="size-3.5" />
  ) : (
    <ArrowUpRight className="size-3.5" />
  );
}

function greetingForNow(name: string | null) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return `Good ${part}${name ? `, ${name}` : ""}`;
}

function CommandSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading your day">
      <div className="h-6 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
      <div className="h-40 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-[0.875rem] bg-white/[0.045]"
          />
        ))}
      </div>
      <div className="h-44 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
    </div>
  );
}

type CommandTab = "overview" | "nutrition" | "insights";

export function CommandCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<HealthSummary>(emptyHealthSummary);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<CommandTab>("overview");
  const [showComponents, setShowComponents] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Health data is optional context — it fails soft to an empty summary.
    fetchHealthSummary().then((summary) => {
      if (isMounted) {
        setHealth(summary);
      }
    });

    fetchDashboardData()
      .then((dashboardData) => {
        if (isMounted) {
          const localMealPlan = loadMealPlanFromStorage();
          const shouldUseLocalPlan =
            !hasPlannedMeals(dashboardData.mealPlan) &&
            hasPlannedMeals(localMealPlan);

          setData(
            shouldUseLocalPlan
              ? { ...dashboardData, mealPlan: localMealPlan }
              : dashboardData
          );
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load your day."
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

    const readiness = calculateReadiness({
      ...data,
      healthToday: health.today,
      healthRecent: health.recent,
    });
    const load = classifyWeeklyLoad(data.workoutsLastSevenDays);
    const streak = calculateTrainingStreak({
      workoutDates: data.workoutsLastSevenDays.map(
        (workout) => workout.workout_date
      ),
      habitDefinitions: data.habitDefinitions,
      habitCompletions: data.recentHabitCompletions,
    });
    const mission = buildTodayMission({
      selectedGoal: data.selectedTrainingGoal,
      workoutsThisWeek: data.workoutsThisWeek,
      todayDate: getDateInputValue(),
    });
    const weight = calculateWeightProgress(data);
    const weekly = buildWeeklyConsistencyData(data);
    const workoutStats = calculateWeeklyWorkoutStats(
      data.workoutsLastSevenDays
    );

    return { readiness, load, streak, mission, weight, weekly, workoutStats };
  }, [data, health]);

  if (isLoading) {
    return <CommandSkeleton />;
  }

  if (error || !data || !derived) {
    return (
      <div className="lf-panel p-5">
        <p className="text-sm font-bold text-strain">
          {error || "Could not load your day."}
        </p>
      </div>
    );
  }

  const { readiness, load, streak, mission, weight } = derived;
  const firstName =
    data.profile?.full_name?.split(/\s+/)[0] ??
    data.profile?.email?.split("@")[0] ??
    null;
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const readinessColor = readinessColors[readiness.state];
  const weightTrend =
    weight.totalChange === null || Math.abs(weight.totalChange) < 0.05
      ? ("flat" as const)
      : weight.totalChange > 0
        ? ("up" as const)
        : ("down" as const);
  const todayMacros = calculateTodayMacros(data);

  return (
    <div className="mx-auto max-w-4xl space-y-3 sm:space-y-4">
      {/* Header */}
      <header className="lf-rise flex items-end justify-between gap-3">
        <div>
          <p className="lf-eyebrow">{today}</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            {greetingForNow(firstName)}
          </h1>
        </div>
        {streak > 0 ? (
          <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent-strong">
            <Flame className="size-3.5" />
            <span className="lf-num">{streak}-day streak</span>
          </span>
        ) : null}
      </header>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:items-stretch">
      <div className="space-y-3 sm:space-y-4">
      {/* Readiness */}
      <section
        className="lf-rise lf-rise-1 lf-panel relative overflow-hidden p-4 sm:p-5"
        style={{
          backgroundImage: `radial-gradient(28rem 12rem at 85% -20%, color-mix(in srgb, ${readinessColor} 10%, transparent), transparent)`,
        }}
      >
        <div className="flex items-center gap-4 sm:gap-6">
          <ReadinessRing readiness={readiness} />
          <div className="min-w-0 flex-1">
            <p className="lf-eyebrow" style={{ color: readinessColor }}>
              Performance state
            </p>
            <p className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl">
              {readiness.headline}
            </p>
            <p className="mt-1 text-sm leading-snug text-muted">
              {readiness.guidance}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowComponents((current) => !current)}
          aria-expanded={showComponents}
          className="lf-press mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-muted transition hover:text-foreground"
        >
          {showComponents ? "Hide breakdown" : "What drives this?"}
          <ChevronDown
            className={`size-3.5 transition-transform ${showComponents ? "rotate-180" : ""}`}
          />
        </button>
        {showComponents ? (
          <div className="lf-fade mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {readiness.components.map((component) => (
              <div key={component.label} className="lf-inset p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[0.7rem] font-bold text-muted">
                    {component.label}
                  </p>
                  <p className="lf-num text-sm font-black">{component.score}</p>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${component.score}%`,
                      background: readinessColor,
                    }}
                  />
                </div>
                <p className="mt-2 text-[0.68rem] leading-snug text-muted">
                  {component.detail}
                </p>
              </div>
            ))}
            <p className="col-span-2 text-[0.65rem] leading-snug text-ink-dim sm:col-span-4">
              {health.connection
                ? `Guidance from your logged training and data synced from ${platformLabel(health.connection.platform)} — not a medical measurement.`
                : "Guidance from your logged training, sleep habits, and consistency — not a medical measurement."}
            </p>
          </div>
        ) : null}
      </section>

      {/* Metric strip — swaps in synced health metrics when connected */}
      <section className="lf-rise lf-rise-2 grid grid-cols-4 gap-2">
        {health.today?.steps != null ? (
          <div className="lf-inset p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Steps</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {new Intl.NumberFormat("en").format(health.today.steps)}
            </p>
            <p
              className={`lf-num mt-0.5 text-[0.65rem] font-bold ${
                health.today.steps >= health.goals.dailySteps
                  ? "text-ready"
                  : "text-muted"
              }`}
            >
              {Math.min(
                999,
                Math.round((health.today.steps / health.goals.dailySteps) * 100)
              )}
              % of goal
            </p>
          </div>
        ) : (
          <div className="lf-inset p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Streak</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {streak}
            </p>
            <p className="mt-0.5 text-[0.65rem] font-bold text-muted">
              {streak === 1 ? "day" : "days"}
            </p>
          </div>
        )}
        {health.today?.sleep_minutes != null ? (
          <div className="lf-inset p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Sleep</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {formatSleep(health.today.sleep_minutes)}
            </p>
            <p
              className={`mt-0.5 text-[0.65rem] font-bold ${
                health.today.sleep_minutes >= health.goals.sleepMinutes - 30
                  ? "text-ready"
                  : "text-muted"
              }`}
            >
              of {formatSleep(health.goals.sleepMinutes)}
            </p>
          </div>
        ) : (
          <div className="lf-inset p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Load</p>
            <p className="mt-1 truncate font-display text-base font-black sm:text-xl">
              {load.label}
            </p>
            <p className="lf-num mt-0.5 text-[0.65rem] font-bold text-muted">
              {load.minutes} min
            </p>
          </div>
        )}
        <Link href="/weight" className="lf-press lf-inset block p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Weight</p>
          <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
            {weight.currentWeight !== null
              ? weight.currentWeight.toFixed(1)
              : "—"}
          </p>
          <p
            className={`mt-0.5 flex items-center gap-0.5 text-[0.65rem] font-bold ${
              weightTrend === "down"
                ? "text-ready"
                : weightTrend === "up"
                  ? "text-caution"
                  : "text-muted"
            }`}
          >
            <TrendArrow direction={weightTrend} />
            {weight.totalChange !== null
              ? `${Math.abs(weight.totalChange).toFixed(1)} kg`
              : "kg"}
          </p>
        </Link>
        <Link href="/habits" className="lf-press lf-inset block p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Habits</p>
          <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
            {data.todayHabits.percentage}%
          </p>
          <p className="lf-num mt-0.5 text-[0.65rem] font-bold text-muted">
            {data.todayHabits.completed}/{data.todayHabits.total} today
          </p>
        </Link>
      </section>
      {health.connection ? (
        <p className="lf-rise lf-rise-2 -mt-1 px-1 text-right text-[0.6rem] font-semibold text-ink-dim">
          Synced from {platformLabel(health.connection.platform)}
        </p>
      ) : null}
      </div>

      {/* Mission */}
      <section className="lf-rise lf-rise-3 lf-panel relative flex flex-col justify-center overflow-hidden p-4 sm:p-5">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(26rem 14rem at 12% 120%, rgba(240,71,46,0.12), transparent)",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <p className="lf-eyebrow text-accent-strong">
              {mission.alreadyTrainedToday
                ? "Mission complete"
                : "Today's mission"}
            </p>
            <span className="lf-num rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-bold text-muted">
              {mission.completedThisWeek}/{mission.totalSessions} this week
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-black leading-tight tracking-tight sm:text-3xl">
            {mission.session.title}
          </h2>
          <p className="lf-num mt-1.5 text-sm font-semibold text-muted">
            {mission.session.durationMinutes} min ·{" "}
            {mission.session.exercises.length} exercises ·{" "}
            {mission.session.intensity}
          </p>

          {mission.alreadyTrainedToday ? (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 rounded-xl border border-ready/25 bg-ready/10 px-4 py-3 text-sm font-bold text-ready">
                <Check className="size-4" />
                Session logged today. Recovery is training too.
              </p>
              <Link
                href={`/workouts/live?goal=${encodeURIComponent(mission.goal)}&session=${mission.sessionIndex}`}
                className="lf-press inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted transition hover:text-foreground"
              >
                Train anyway
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <Link
              href={`/workouts/live?goal=${encodeURIComponent(mission.goal)}&session=${mission.sessionIndex}`}
              className="lf-press mt-4 flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-accent text-[0.95rem] font-black tracking-wide text-white shadow-[0_10px_30px_rgba(240,71,46,0.35)] transition hover:bg-accent-strong"
            >
              <Play className="size-4 fill-current" />
              BEGIN WORKOUT
            </Link>
          )}

          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/training-plan"
              className="text-xs font-bold text-muted transition hover:text-foreground"
            >
              {mission.goal} plan →
            </Link>
            <Link
              href="/workouts/new"
              className="text-xs font-bold text-muted transition hover:text-foreground"
            >
              Log manually
            </Link>
          </div>
        </div>
      </section>
      </div>

      {/* Tabs */}
      <section className="lf-rise lf-rise-4">
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1"
        >
          {(
            [
              ["overview", "Overview"],
              ["nutrition", "Nutrition"],
              ["insights", "Insights"],
            ] as Array<[CommandTab, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`lf-press rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
                tab === id
                  ? "bg-white/[0.09] text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {tab === "overview" ? (
            <div className="lf-fade space-y-3">
              <div className="lf-panel p-4 sm:p-5">
                <p className="lf-eyebrow mb-3">Weekly rhythm</p>
                <WeeklyProgressChart data={derived.weekly} />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { href: "/body", label: "Body map", detail: "Muscle recovery" },
                  { href: "/progress", label: "Progress", detail: "Your journey" },
                  { href: "/report", label: "Weekly report", detail: "Review the week" },
                  { href: "/workouts", label: "History", detail: `${derived.workoutStats.workoutsCompleted} this week` },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="lf-press lf-inset group flex flex-col justify-between gap-2 p-3"
                  >
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="flex items-center justify-between text-[0.68rem] font-semibold text-muted">
                      {item.detail}
                      <ArrowRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "nutrition" ? (
            <div className="lf-fade lf-panel p-4 sm:p-5">
              {todayMacros.plannedMeals > 0 ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <p className="lf-eyebrow">Planned today</p>
                    <p className="lf-num text-xs font-bold text-muted">
                      {todayMacros.plannedMeals} meals
                    </p>
                  </div>
                  <p className="lf-num mt-2 font-display text-3xl font-black">
                    {new Intl.NumberFormat("en").format(todayMacros.calories)}
                    <span className="ml-1 text-sm font-bold text-muted">kcal</span>
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {calculateMacroBreakdown(todayMacros).map((macro) => (
                      <div key={macro.label}>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{macro.label}</span>
                          <span className="lf-num text-muted">
                            {macro.grams}g · {macro.percentage}%
                          </span>
                        </div>
                        <div
                          className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-white/[0.03]"
                          role="progressbar"
                          aria-label={`${macro.label}: ${macro.percentage}%`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={macro.percentage}
                        >
                          <div
                            className={`liftlog-progress-bar h-full min-w-1 rounded-full ${macro.barClassName}`}
                            style={{ width: `${macro.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="lf-num mt-4 border-t border-line pt-3 text-xs font-semibold text-muted">
                    Week: {calculateWeeklyMacros(data).plannedMealsCount} meals ·{" "}
                    {new Intl.NumberFormat("en").format(
                      calculateWeeklyMacros(data).weeklyCalories
                    )}{" "}
                    kcal planned
                  </p>
                </>
              ) : (
                <div className="py-2 text-center">
                  <p className="font-display text-lg font-black">
                    No meals planned today
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                    Plan meals to see calories and macros here.
                  </p>
                  <Link
                    href="/meal-planner"
                    className="lf-press mt-4 inline-flex rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-bold transition hover:bg-white/[0.12]"
                  >
                    Open meal planner
                  </Link>
                </div>
              )}
            </div>
          ) : null}

          {tab === "insights" ? (
            <div className="lf-fade space-y-2">
              {generateProgressInsights(data).map((insight) => (
                <div
                  key={insight}
                  className="lf-inset flex items-start gap-3 p-3.5"
                >
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                  <p className="text-sm font-semibold leading-snug">{insight}</p>
                </div>
              ))}
              <Link
                href="/report"
                className="lf-press flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-muted transition hover:text-foreground"
              >
                Open weekly report
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
