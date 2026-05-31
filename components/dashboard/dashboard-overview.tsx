"use client";

import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import {
  buildWeeklyConsistencyData,
  calculateAverageHabitCompletion,
  calculateWeeklyWorkoutStats,
  calculateWeightProgress,
  countCompletedHabits,
  fetchDashboardData,
  generateProgressInsights,
  type DashboardData,
} from "@/src/lib/dashboard/queries";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Download,
  Dumbbell,
  Plus,
  Scale,
  Settings,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const toolLinks = [
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/meal-planner", label: "Meal Planner", icon: CalendarDays },
  { href: "/grocery-list", label: "Grocery List", icon: ShoppingBasket },
  { href: "/training-plan", label: "Training Plan", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings", label: "Install app", icon: Download },
];

const quickActionLinks = [
  { href: "/workouts/new", label: "Log workout", icon: Dumbbell, primary: true },
  { href: "/weight", label: "Add weight", icon: Scale, primary: true },
  { href: "/habits", label: "Update habits", icon: Sprout },
  { href: "/training-plan", label: "Training plan", icon: Trophy },
  { href: "/meal-planner", label: "Meal planner", icon: CalendarDays },
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/grocery-list", label: "Grocery list", icon: ShoppingBasket },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatWeight(value: number) {
  return `${value.toFixed(1)} kg`;
}

function formatSignedWeight(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} kg`;
}

function getGoalSummary(latestWeight: number | null, goalWeight: number | null) {
  if (goalWeight === null) {
    return {
      value: "No goal set",
      detail: "Set a goal weight to track progress.",
    };
  }

  if (latestWeight === null) {
    return {
      value: formatWeight(goalWeight),
      detail: "Add your first weight log to track progress.",
    };
  }

  const difference = latestWeight - goalWeight;

  if (Math.abs(difference) < 0.05) {
    return {
      value: formatWeight(goalWeight),
      detail: "Goal reached.",
    };
  }

  return {
    value: formatWeight(goalWeight),
    detail: `${Math.abs(difference).toFixed(1)} kg from goal.`,
  };
}

function getMotivationMessage({
  completedHabits,
  habitPercent,
  latestWeightValue,
  weeklyWorkouts,
}: {
  completedHabits: number;
  habitPercent: number;
  latestWeightValue: number | null;
  weeklyWorkouts: number;
}) {
  if (completedHabits === 7) {
    return "Congratulations. You hit every habit today.";
  }

  if (weeklyWorkouts >= 4) {
    return "Strong week. You are building real momentum.";
  }

  if (habitPercent >= 70) {
    return "Good consistency today. Keep the streak alive.";
  }

  if (weeklyWorkouts === 0) {
    return "Start small today. One logged session beats zero.";
  }

  if (latestWeightValue === null) {
    return "Add a weight check-in to start tracking your trend.";
  }

  return "Keep moving. Small logged wins compound.";
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchDashboardData()
      .then((dashboardData) => {
        if (isMounted) {
          setData(dashboardData);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load dashboard data."
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

  const completedHabits = countCompletedHabits(data?.todayHabits ?? null);
  const habitPercent = Math.round((completedHabits / 7) * 100);
  const totalWeightChange =
    data ? calculateWeightProgress(data).totalChange : null;
  const weeklyWorkoutStats = data
    ? calculateWeeklyWorkoutStats(data.workoutsLastSevenDays)
    : { workoutsCompleted: 0, totalMinutes: 0, workoutDays: 0 };
  const weeklyMinutes = weeklyWorkoutStats.totalMinutes;
  const weeklyConsistency = data ? buildWeeklyConsistencyData(data) : [];
  const averageHabitCompletion = data
    ? calculateAverageHabitCompletion(data)
    : 0;
  const insights = data ? generateProgressInsights(data) : [];
  const latestWeightValue = data?.latestWeight?.weight_kg ?? null;
  const goalSummary = getGoalSummary(latestWeightValue, data?.goalWeightKg ?? null);
  const weightProgress = data ? calculateWeightProgress(data) : null;
  const weightLogsThisWeek = data?.recentWeights.length ?? 0;
  const motivationMessage = getMotivationMessage({
    completedHabits,
    habitPercent,
    latestWeightValue,
    weeklyWorkouts: weeklyWorkoutStats.workoutsCompleted,
  });

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Real fitness dashboard"
        title="Track the quiet wins that build the big ones."
        description="See your weight, workouts, habits, and weekly momentum in one calm overview."
        imageSrc={fitnessImages.strengthTraining}
        imageAlt="Athlete strength training in a gym"
        variant="performance"
      >
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/weight"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-stone-950"
            >
              <Scale className="size-4" />
              Add weight log
            </Link>
            <Link
              href="/workouts/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-sun px-4 py-2 text-sm font-black text-stone-950"
            >
              <Plus className="size-4" />
              Add workout
            </Link>
            <Link
              href="/habits"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
            >
              <Sprout className="size-4" />
              Update habits
            </Link>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
            >
              <BookOpen className="size-4" />
              Recipes
            </Link>
            <Link
              href="/meal-planner"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
            >
              <CalendarDays className="size-4" />
              Plan meals
            </Link>
            <Link
              href="/grocery-list"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
            >
              <ShoppingBasket className="size-4" />
              Grocery list
            </Link>
            <Link
              href="/training-plan"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white"
            >
              <Trophy className="size-4" />
              Training plan
            </Link>
          </div>
      </HeroPanel>

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <FitnessCard>
          <p className="text-sm font-black text-muted">
            Loading dashboard data...
          </p>
        </FitnessCard>
      ) : null}

      {!isLoading && !error ? (
        <FitnessCard className="border-accent/30 bg-gradient-to-r from-accent/15 via-white/[0.04] to-sun/15 liftlog-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-stone-950 shadow-lg shadow-accent/20">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                  Today&apos;s push
                </p>
                <h2 className="mt-2 font-display text-2xl font-black">
                  {motivationMessage}
                </h2>
              </div>
            </div>
            <Link
              href="/workouts/new"
              className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-black text-stone-950 transition hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              Log a win
            </Link>
          </div>
        </FitnessCard>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Today" title="Your home base" />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                Habits
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {habitPercent}%
              </p>
              <p className="mt-1 text-sm text-muted">
                {completedHabits} of 7 complete
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                This week
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {weeklyWorkoutStats.workoutsCompleted}
              </p>
              <p className="mt-1 text-sm text-muted">workouts logged</p>
            </div>
            <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                Latest weight
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {latestWeightValue !== null ? formatWeight(latestWeightValue) : "--"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {data?.latestWeight
                  ? formatDate(data.latestWeight.logged_at)
                  : "Add your first log"}
              </p>
            </div>
          </div>
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="Quick actions" title="Do the next thing" />
          <div className="grid grid-cols-2 gap-2">
            {quickActionLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-16 flex-col justify-between rounded-2xl px-3 py-3 text-sm font-black transition hover:-translate-y-0.5 ${
                    item.primary
                      ? "bg-accent text-stone-950"
                      : "border border-line bg-white/65 text-foreground hover:border-accent"
                  }`}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </FitnessCard>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Current weight"
          value={data?.latestWeight ? formatWeight(data.latestWeight.weight_kg) : "--"}
          detail={
            data?.latestWeight
              ? `Logged ${formatDate(data.latestWeight.logged_at)}.`
              : "No weight logs yet."
          }
          icon={<Scale className="size-5" />}
          tone="yellow"
        />
        <FitnessCard className="hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(23,33,28,0.13)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                Goal weight
              </p>
              <p className="mt-3 font-display text-3xl font-black tracking-tight">
                {goalSummary.value}
              </p>
            </div>
            <div className="rounded-2xl bg-sun p-3 text-stone-950 shadow-lg shadow-stone-900/10">
              <Target className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            {goalSummary.detail}
          </p>
          {data?.goalWeightKg === null ? (
            <Link
              href="/settings"
              className="mt-4 inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-black text-stone-950"
            >
              Set goal
            </Link>
          ) : totalWeightChange !== null ? (
            <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-muted">
              Total change: {formatSignedWeight(totalWeightChange)}
            </p>
          ) : null}
        </FitnessCard>
        <MetricCard
          label="Weekly workouts"
          value={`${weeklyWorkoutStats.workoutsCompleted}`}
          detail={`${weeklyMinutes} training minutes over the last 7 days.`}
          icon={<Dumbbell className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Habit completion"
          value={`${habitPercent}%`}
          detail={`${completedHabits} of 7 habits complete today.`}
          icon={<Sprout className="size-5" />}
          tone="yellow"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <FitnessCard>
          <SectionHeader
            eyebrow="Weekly consistency"
            title="Your weekly rhythm"
          />
          <p className="mb-4 text-sm leading-6 text-muted">
            Your weekly rhythm across habits, training, and check-ins.
          </p>
          {data ? (
            <WeeklyProgressChart data={weeklyConsistency} />
          ) : (
            <div className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 text-sm font-black text-muted">
              Chart will appear once dashboard data loads.
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="Latest workout" title="Fresh from the log" />
          <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-5">
            {data?.latestWorkout ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent text-stone-950">
                    <Activity className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-black">
                      {data.latestWorkout.title}
                    </p>
                    <p className="text-sm font-medium text-muted">
                      {formatDateTime(data.latestWorkout.workout_date)} -{" "}
                      {data.latestWorkout.duration_minutes ?? 0} min
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-6 text-muted">
                  {data.latestWorkout.notes ??
                    "No notes yet. Still counts. The log goblin accepts all honest offerings."}
                </p>
              </>
            ) : (
              <div>
                <p className="font-display text-xl font-black">
                  No workouts yet.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Add a workout to unlock latest-session details.
                </p>
                <Link
                  href="/workouts/new"
                  className="mt-4 inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-black text-stone-950"
                >
                  Add workout
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-accent" />
                <p className="font-black">Today habits</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${habitPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="size-5 text-accent" />
                <p className="font-black">This week</p>
              </div>
              <p className="mt-3 text-sm font-medium text-muted">
                {weeklyWorkoutStats.workoutsCompleted} workouts and{" "}
                {weeklyMinutes} minutes logged.
              </p>
            </div>
          </div>
        </FitnessCard>
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="Weekly report" title="Last 7 days" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Workouts
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You logged {weeklyWorkoutStats.workoutsCompleted} workouts this
              week.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Training time
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You completed {weeklyWorkoutStats.totalMinutes} training minutes.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Habits
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You completed {averageHabitCompletion}% of your habits over the
              last 7 days.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Weight logs
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You logged weight {weightLogsThisWeek} times this week.
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Current weight
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {weightProgress?.currentWeight !== null &&
              weightProgress?.currentWeight !== undefined
                ? `Your latest weight is ${formatWeight(
                    weightProgress.currentWeight
                  )}.`
                : "Add your first weight log to unlock weight trends."}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Goal progress
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {weightProgress?.goalWeight === null
                ? "Set a goal weight to track progress."
                : weightProgress?.goalReached
                  ? "Goal reached based on your latest log."
                  : weightProgress?.distanceFromGoal !== null &&
                      weightProgress?.distanceFromGoal !== undefined
                    ? `You are ${weightProgress.distanceFromGoal.toFixed(
                        1
                      )} kg from your goal.`
                    : "Add your first weight log to track progress."}
            </p>
          </div>
        </div>
      </FitnessCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <FitnessCard key={insight} className="p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
              Insight
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {insight}
            </p>
          </FitnessCard>
        ))}
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="Tools" title="Explore LiftLog" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {toolLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="min-h-28 rounded-[1.25rem] border border-line bg-white/65 p-4 transition hover:-translate-y-0.5 hover:border-accent"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-accent text-stone-950">
                  <Icon className="size-4" />
                </span>
                <p className="mt-3 text-sm font-black">{item.label}</p>
              </Link>
            );
          })}
        </div>
      </FitnessCard>
    </div>
  );
}
