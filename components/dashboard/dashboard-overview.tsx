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
  buildFitnessJourneySummary,
  calculateMacroBreakdown,
  calculateTodayMacros,
  calculateAverageHabitCompletion,
  calculateWeeklyMacros,
  calculateWeeklyWorkoutStats,
  calculateWeightProgress,
  countCompletedHabits,
  countTotalHabits,
  fetchDashboardData,
  generateDashboardMotivation,
  generateProgressInsights,
  getHabitCompletionPercent,
  type DashboardData,
} from "@/src/lib/dashboard/queries";
import {
  hasPlannedMeals,
  loadMealPlanFromStorage,
} from "@/src/lib/meal-planner/storage";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import {
  Activity,
  BookOpen,
  CalendarDays,
  Download,
  Dumbbell,
  Flame,
  Plus,
  Scale,
  Settings,
  ShoppingBasket,
  Sparkles,
  Sprout,
  Target,
  Trophy,
  TrendingUp,
  Utensils,
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(value);
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

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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
  const totalHabits = countTotalHabits(data?.todayHabits ?? null);
  const habitPercent = getHabitCompletionPercent(data?.todayHabits ?? null);
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
  const todayMacros = data
    ? calculateTodayMacros(data)
    : { calories: 0, protein: 0, carbs: 0, fat: 0, plannedMeals: 0 };
  const weeklyMacros = data
    ? calculateWeeklyMacros(data)
    : {
        weeklyCalories: 0,
        weeklyProtein: 0,
        weeklyCarbs: 0,
        weeklyFat: 0,
        averageDailyCalories: 0,
        averageDailyProtein: 0,
        averageDailyCarbs: 0,
        averageDailyFat: 0,
        plannedMealsCount: 0,
      };
  const macroBreakdown = calculateMacroBreakdown(todayMacros);
  const fitnessJourney = data ? buildFitnessJourneySummary(data) : [];
  const motivationMessage = data
    ? generateDashboardMotivation(data)
    : "Keep moving. Small logged wins compound.";

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
                <h2
                  key={motivationMessage}
                  className="liftlog-slide-in mt-2 font-display text-2xl font-black"
                >
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
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                Habits
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {habitPercent}%
              </p>
              <p className="mt-1 text-sm text-muted">
                {totalHabits
                  ? `${completedHabits} of ${totalHabits} complete`
                  : "Build your habit list"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                This week
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {weeklyWorkoutStats.workoutsCompleted}
              </p>
              <p className="mt-1 text-sm text-muted">workouts logged</p>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
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
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
                Meals today
              </p>
              <p className="mt-2 font-display text-3xl font-black">
                {todayMacros.plannedMeals}
              </p>
              <p className="mt-1 text-sm text-muted">
                {todayMacros.plannedMeals
                  ? `${todayMacros.protein}g protein planned`
                  : "Plan your first meal"}
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

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Nutrition" title="Today's macros" />
          {todayMacros.plannedMeals > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-[1.25rem] bg-accent p-4 text-stone-950">
                  <p className="text-xs font-black uppercase tracking-[0.16em]">
                    Calories
                  </p>
                  <p
                    key={todayMacros.calories}
                    className="liftlog-number-change mt-2 font-display text-3xl font-black"
                  >
                    {formatNumber(todayMacros.calories)}
                  </p>
                </div>
                {[
                  { label: "Protein", value: `${todayMacros.protein}g` },
                  { label: "Carbs", value: `${todayMacros.carbs}g` },
                  { label: "Fat", value: `${todayMacros.fat}g` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                      {item.label}
                    </p>
                    <p
                      key={item.value}
                      className="liftlog-number-change mt-2 font-display text-3xl font-black"
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3">
                {macroBreakdown.map((macro) => (
                  <div key={macro.label}>
                    <div className="mb-2 flex items-center justify-between text-sm font-black">
                      <span>{macro.label}</span>
                      <span className="text-muted">
                        {macro.grams}g - {macro.percentage}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className={`liftlog-progress-bar h-full rounded-full ${macro.barClassName}`}
                        style={{ width: `${macro.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-line bg-white/[0.045] p-5">
              <p className="font-display text-xl font-black">
                No meals planned for today.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Choose recipes in your meal planner to see calories and macros
                here.
              </p>
              <Link
                href="/meal-planner"
                className="mt-4 inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-black text-stone-950"
              >
                Plan meals
              </Link>
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="This week" title="Nutrition overview" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <Flame className="size-5 text-accent" />
              <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-muted">
                Weekly calories
              </p>
              <p
                key={weeklyMacros.weeklyCalories}
                className="liftlog-number-change mt-2 font-display text-2xl font-black"
              >
                {formatNumber(weeklyMacros.weeklyCalories)}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <Utensils className="size-5 text-accent" />
              <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-muted">
                Planned meals
              </p>
              <p
                key={weeklyMacros.plannedMealsCount}
                className="liftlog-number-change mt-2 font-display text-2xl font-black"
              >
                {weeklyMacros.plannedMealsCount}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Avg daily calories
              </p>
              <p className="mt-2 font-display text-2xl font-black">
                {formatNumber(weeklyMacros.averageDailyCalories)}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Avg daily protein
              </p>
              <p className="mt-2 font-display text-2xl font-black">
                {weeklyMacros.averageDailyProtein}g
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-[1.25rem] bg-white/[0.055] p-4 text-sm font-bold leading-6 text-muted shadow-inner shadow-white/[0.02]">
            {weeklyMacros.plannedMealsCount > 0
              ? `${weeklyMacros.weeklyProtein}g protein, ${weeklyMacros.weeklyCarbs}g carbs, and ${weeklyMacros.weeklyFat}g fat planned this week.`
              : "Plan a few meals to turn this into a weekly nutrition snapshot."}
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
              href="/weight"
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
          detail={
            totalHabits
              ? `${completedHabits} of ${totalHabits} habits complete today.`
              : "Add habits to start tracking today."
          }
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
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
              <div className="flex items-center gap-3">
                <TrendingUp className="size-5 text-accent" />
                <p className="font-black">Today habits</p>
              </div>
              <div className="mt-3 h-2 rounded-full bg-stone-200">
                <div
                  className="liftlog-progress-bar h-full rounded-full bg-accent"
                  style={{ width: `${habitPercent}%` }}
                />
              </div>
            </div>
            <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
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
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Workouts
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You logged {weeklyWorkoutStats.workoutsCompleted} workouts this
              week.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Training time
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You completed {weeklyWorkoutStats.totalMinutes} training minutes.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Habits
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You completed {averageHabitCompletion}% of your habits over the
              last 7 days.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Weight logs
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              You logged weight {weightLogsThisWeek} times this week.
            </p>
          </div>
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
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
          <div className="rounded-[1.25rem] bg-white/[0.055] p-4 shadow-inner shadow-white/[0.02]">
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

      <FitnessCard>
        <SectionHeader eyebrow="Fitness journey" title="Your bigger picture" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {fitnessJourney.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-[1.25rem] border border-line bg-white/65 p-4 transition hover:-translate-y-0.5 hover:border-accent"
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                {item.label}
              </p>
              <p className="mt-2 font-display text-2xl font-black">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-muted">
                {item.detail}
              </p>
            </Link>
          ))}
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
