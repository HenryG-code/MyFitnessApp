"use client";

import { CommandSkeleton } from "@/components/dashboard/command-skeleton";
import { CommandTabs } from "@/components/dashboard/command-tabs";
import { AchievementShelf } from "@/components/dashboard/achievement-shelf";
import { MetricStrip, type WeightTrend } from "@/components/dashboard/metric-strip";
import { MissionPanel } from "@/components/dashboard/mission-panel";
import { ReadinessPanel } from "@/components/dashboard/readiness-panel";
import {
  buildWeeklyConsistencyData,
  calculateWeeklyWorkoutStats,
  calculateWeightProgress,
  fetchDashboardData,
  type DashboardData,
} from "@/src/lib/dashboard/queries";
import {
  emptyHealthSummary,
  fetchHealthSummary,
  type HealthSummary,
} from "@/src/lib/health/queries";
import {
  hasPlannedMeals,
  loadMealPlanFromStorage,
} from "@/src/lib/meal-planner/storage";
import {
  calculateReadiness,
  calculateTrainingStreak,
  classifyWeeklyLoad,
} from "@/src/lib/performance/readiness";
import { buildAchievements } from "@/src/lib/performance/achievements";
import { getWeeklyCoachMessage } from "@/src/lib/dashboard/motivation";
import { Flame, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function greetingForNow(name: string | null) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  return `Good ${part}${name ? `, ${name}` : ""}`;
}

export function CommandCenter() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<HealthSummary>(emptyHealthSummary);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    const weight = calculateWeightProgress(data);
    const weekly = buildWeeklyConsistencyData(data);
    const workoutStats = calculateWeeklyWorkoutStats(
      data.workoutsLastSevenDays
    );

    return { readiness, load, streak, weight, weekly, workoutStats };
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

  const { readiness, load, streak, weight } = derived;
  const firstName =
    data.profile?.full_name?.split(/\s+/)[0] ??
    data.profile?.email?.split("@")[0] ??
    null;
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const weightTrend: WeightTrend =
    weight.totalChange === null || Math.abs(weight.totalChange) < 0.05
      ? "flat"
      : weight.totalChange > 0
        ? "up"
        : "down";
  const weeklyCoachMessage = getWeeklyCoachMessage(new Date(), firstName ?? "");
  const perfectHabitDays = data.recentHabits.filter(
    (day) => day.total > 0 && day.completed === day.total
  ).length;
  const bestDailySteps = health.recent.reduce(
    (best, day) => Math.max(best, day.steps ?? 0),
    health.today?.steps ?? 0
  );
  const achievements = buildAchievements({
    bestDailySteps,
    perfectHabitDays,
    weeklyWorkoutsCompleted: data.todayMission.completedThisWeek,
    weeklyWorkoutTarget: data.todayMission.totalSessions,
    streakDays: streak,
  });

  return (
    <div className="mx-auto min-w-0 max-w-4xl space-y-3 overflow-x-clip sm:space-y-4">
      <header className="lf-rise flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="lf-eyebrow">{today}</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            {greetingForNow(firstName)}
          </h1>
          <p className="mt-2 flex max-w-xl items-start gap-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-sun" />
            <span>{weeklyCoachMessage}</span>
          </p>
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
          <ReadinessPanel readiness={readiness} health={health} />
          <MetricStrip
            health={health}
            streak={streak}
            load={load}
            weight={weight}
            weightTrend={weightTrend}
            todayHabits={data.todayHabits}
          />
        </div>

        <MissionPanel mission={data.todayMission} />
      </div>

      <AchievementShelf achievements={achievements} />

      <CommandTabs
        data={data}
        weekly={derived.weekly}
        workoutStats={derived.workoutStats}
      />
    </div>
  );
}
