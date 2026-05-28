"use client";

import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import {
  countCompletedHabits,
  fetchDashboardData,
  getDateDaysAgo,
  getDateInputValue,
  type DashboardData,
} from "@/src/lib/dashboard/queries";
import type { Workout } from "@/src/lib/supabase/database.types";
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Plus,
  Scale,
  Sprout,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type WeeklyPoint = {
  day: string;
  workouts: number;
  habits: number;
};

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
  }).format(new Date(value));
}

function formatWeight(value: number) {
  return `${value.toFixed(1)} kg`;
}

function getWorkoutDate(workout: Workout) {
  return getDateInputValue(new Date(workout.started_at));
}

function buildWeeklyProgress(data: DashboardData): WeeklyPoint[] {
  return Array.from({ length: 7 }, (_item, index) => {
    const date = getDateDaysAgo(6 - index);
    const habitRow = data.recentHabits.find(
      (habit) => habit.habit_date === date
    );
    const habitPercent = Math.round((countCompletedHabits(habitRow ?? null) / 7) * 100);
    const workouts = data.workoutsLastSevenDays.filter(
      (workout) => getWorkoutDate(workout) === date
    ).length;

    return {
      day: formatDate(date),
      habits: habitPercent,
      workouts,
    };
  });
}

function getWeeklyMinutes(workouts: Workout[]) {
  return workouts.reduce(
    (total, workout) => total + (workout.duration_minutes ?? 0),
    0
  );
}

function getInsights(data: DashboardData) {
  const completedHabits = countCompletedHabits(data.todayHabits);
  const habitPercent = Math.round((completedHabits / 7) * 100);
  const latestWeight = data.latestWeight
    ? `Latest weight is ${formatWeight(data.latestWeight.weight_kg)}.`
    : "Add your first weight log to unlock weight trends.";
  const latestWorkout = data.latestWorkout
    ? `Your latest workout was ${data.latestWorkout.title}.`
    : "Add your first workout to start a training history.";

  return [
    `You completed ${data.workoutsThisWeek.length} workouts this week.`,
    `Today's habit completion is ${habitPercent}%.`,
    latestWeight,
    latestWorkout,
  ];
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
    data?.firstWeight && data.latestWeight
      ? data.latestWeight.weight_kg - data.firstWeight.weight_kg
      : null;
  const weeklyMinutes = data ? getWeeklyMinutes(data.workoutsThisWeek) : 0;
  const weeklyProgress = data ? buildWeeklyProgress(data) : [];
  const insights = data ? getInsights(data) : [];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
            Real fitness dashboard
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            Track the quiet wins that build the big ones.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Your private Supabase data for weight, workouts, and habits in one
            calm overview.
          </p>
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
          </div>
        </div>
      </section>

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
          tone="teal"
        />
        <MetricCard
          label="Goal weight"
          value="--"
          detail={
            totalWeightChange === null
              ? "Goal setting can come later."
              : `Total change: ${totalWeightChange > 0 ? "+" : ""}${totalWeightChange.toFixed(1)} kg.`
          }
          icon={<Target className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Weekly workouts"
          value={`${data?.workoutsThisWeek.length ?? 0}`}
          detail={`${weeklyMinutes} training minutes this week.`}
          icon={<Dumbbell className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Habit completion"
          value={`${habitPercent}%`}
          detail={`${completedHabits} of 7 habits complete today.`}
          icon={<Sprout className="size-5" />}
          tone="teal"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Weekly progress" title="Workouts and habits" />
          {data ? (
            <WeeklyProgressChart data={weeklyProgress} />
          ) : (
            <div className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 text-sm font-black text-muted">
              Chart will appear once dashboard data loads.
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="Latest workout" title="Fresh from the log" />
          <div className="rounded-[1.5rem] bg-[#eaf3dd] p-5">
            {data?.latestWorkout ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
                    <Activity className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-xl font-black">
                      {data.latestWorkout.title}
                    </p>
                    <p className="text-sm font-medium text-muted">
                      {formatDateTime(data.latestWorkout.started_at)} -{" "}
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
                  className="mt-4 inline-flex rounded-2xl bg-accent px-4 py-2 text-sm font-black text-white"
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
                {data?.workoutsThisWeek.length ?? 0} workouts and {weeklyMinutes}{" "}
                minutes logged.
              </p>
            </div>
          </div>
        </FitnessCard>
      </section>

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
    </div>
  );
}
