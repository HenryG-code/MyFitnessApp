"use client";

import { HabitCompletionChart } from "@/components/charts/habit-completion-chart";
import { HabitProgressForm } from "@/components/forms/habit-progress-form";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import type { DailyHabit } from "@/src/lib/supabase/database.types";
import {
  defaultHabits,
  ensureDefaultHabitsForDate,
  fetchRecentHabitHistory,
  getDateInputValue,
  getDateDaysAgo,
  toggleHabitCompletion,
} from "@/src/lib/habits/queries";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Moon,
  Salad,
  Sparkles,
  Sprout,
  TimerReset,
} from "lucide-react";
import { useEffect, useState } from "react";

type WeeklySummaryPoint = {
  date: string;
  percentage: number;
  completed: number;
  total: number;
};

const editableHabitKeys = new Set(["sleep_8_hours", "walked_10k_steps"]);

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatValue(value: number | null, unit: string | null) {
  if (value === null) {
    return `0 ${unit ?? ""}`.trim();
  }

  return `${value.toLocaleString()} ${unit ?? ""}`.trim();
}

function getProgressPercentage(habit: DailyHabit) {
  if (habit.is_completed) {
    return 100;
  }

  const target = habit.target_value ?? 0;
  const completed = habit.completed_value ?? 0;

  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completed / target) * 100));
}

function getHabitIcon(habitKey: string) {
  if (habitKey === "sleep_8_hours") {
    return Moon;
  }

  if (habitKey === "ate_healthy") {
    return Salad;
  }

  if (habitKey === "walked_10k_steps") {
    return TimerReset;
  }

  return Sparkles;
}

function getTodayStats(habits: DailyHabit[]) {
  const completed = habits.filter((habit) => habit.is_completed);
  const latestCompleted = completed
    .slice()
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  const total = habits.length;
  const percentage = total ? Math.round((completed.length / total) * 100) : 0;

  return {
    completedCount: completed.length,
    remainingCount: Math.max(total - completed.length, 0),
    latestCompleted,
    percentage,
    total,
  };
}

function buildWeeklySummary(history: DailyHabit[]) {
  return Array.from({ length: 7 }, (_item, index) => {
    const date = getDateDaysAgo(6 - index);
    const dayHabits = history.filter((habit) => habit.habit_date === date);
    const completed = dayHabits.filter((habit) => habit.is_completed).length;
    const total = dayHabits.length || defaultHabits.length;

    return {
      date: formatDate(date),
      percentage: dayHabits.length ? Math.round((completed / total) * 100) : 0,
      completed,
      total,
    };
  }) satisfies WeeklySummaryPoint[];
}

export function HabitsTracker() {
  const today = getDateInputValue();
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [history, setHistory] = useState<DailyHabit[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);

  async function refreshHabits() {
    setError("");

    try {
      const [todayHabits, recentHistory] = await Promise.all([
        ensureDefaultHabitsForDate(today),
        fetchRecentHabitHistory(7),
      ]);
      setHabits(todayHabits);
      setHistory(recentHistory);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load habits."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([ensureDefaultHabitsForDate(today), fetchRecentHabitHistory(7)])
      .then(([todayHabits, recentHistory]) => {
        if (isMounted) {
          setHabits(todayHabits);
          setHistory(recentHistory);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load habits."
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
  }, [today]);

  const todayStats = getTodayStats(habits);
  const weeklySummary = buildWeeklySummary(history);

  async function handleToggle(habit: DailyHabit) {
    setError("");
    setNotice("");
    setUpdatingHabitId(habit.id);

    try {
      const updated = await toggleHabitCompletion(habit);
      setHabits((currentHabits) =>
        currentHabits.map((currentHabit) =>
          currentHabit.id === updated.id ? updated : currentHabit
        )
      );
      setNotice(
        updated.is_completed
          ? `${updated.label} marked complete.`
          : `${updated.label} marked incomplete.`
      );
      await refreshHabits();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update this habit."
      );
    } finally {
      setUpdatingHabitId(null);
    }
  }

  async function handleProgressSaved(message: string) {
    setNotice(message);
    await refreshHabits();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
          Habits
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Build the boring magic.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Track today&apos;s core habits, update sleep and step progress, and keep
          your streak engine quietly humming.
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
          label="Today's completion"
          value={`${todayStats.percentage}%`}
          detail={`${todayStats.completedCount} of ${todayStats.total} habits complete.`}
          icon={<Sprout className="size-5" />}
          tone="teal"
        />
        <MetricCard
          label="Completed"
          value={`${todayStats.completedCount}`}
          detail="Checked off today."
          icon={<CheckCircle2 className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Remaining"
          value={`${todayStats.remainingCount}`}
          detail="Still available for a late comeback."
          icon={<ClipboardCheck className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Latest completed"
          value={todayStats.latestCompleted?.label ?? "--"}
          detail={
            todayStats.latestCompleted
              ? "Most recently updated complete habit."
              : "No completed habits yet today."
          }
          icon={<CalendarDays className="size-5" />}
          tone="teal"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Today" title={formatDate(today)} />
          {isLoading ? (
            <div className="rounded-[1.5rem] bg-stone-100 p-6 text-sm font-black text-muted">
              Loading today&apos;s habits...
            </div>
          ) : habits.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {habits.map((habit) => {
                const Icon = getHabitIcon(habit.habit_key);
                const progress = getProgressPercentage(habit);
                const isEditable = editableHabitKeys.has(habit.habit_key);

                return (
                  <div
                    key={habit.id}
                    className="rounded-[1.5rem] border border-line bg-white/65 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span
                          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                            habit.is_completed
                              ? "bg-accent text-white"
                              : "bg-stone-950 text-sun"
                          }`}
                        >
                          <Icon className="size-5" />
                        </span>
                        <div>
                          <p className="font-display text-lg font-black leading-tight">
                            {habit.label}
                          </p>
                          <p className="mt-1 text-sm font-medium text-muted">
                            Target:{" "}
                            {formatValue(habit.target_value, habit.unit)}
                          </p>
                          <p className="mt-1 text-sm font-medium text-muted">
                            Done:{" "}
                            {formatValue(habit.completed_value, habit.unit)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggle(habit)}
                        disabled={updatingHabitId === habit.id}
                        className={`rounded-2xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${
                          habit.is_completed
                            ? "bg-[#eaf3dd] text-accent-strong hover:bg-stone-100"
                            : "bg-stone-950 text-white hover:bg-accent"
                        }`}
                      >
                        {updatingHabitId === habit.id
                          ? "Saving..."
                          : habit.is_completed
                            ? "Complete"
                            : "Mark done"}
                      </button>
                    </div>

                    <div className="mt-5 h-3 rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-muted">
                      {progress}% progress
                    </p>

                    {isEditable ? (
                      <HabitProgressForm
                        habit={habit}
                        onSaved={handleProgressSaved}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-[#eaf3dd] p-6">
              <p className="font-display text-xl font-black">
                No habits found for today.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Refresh the page and LiftLog will try to create today&apos;s
                default habits again.
              </p>
            </div>
          )}
        </FitnessCard>

        <FitnessCard>
          <SectionHeader eyebrow="7-day summary" title="Completion trend" />
          {isLoading ? (
            <div className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 text-sm font-black text-muted">
              Loading summary...
            </div>
          ) : (
            <HabitCompletionChart data={weeklySummary} />
          )}
          <div className="mt-4 space-y-2">
            {weeklySummary.map((day) => (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 text-sm"
              >
                <span className="font-black">{day.date}</span>
                <span className="font-bold text-muted">
                  {day.percentage}% - {day.completed}/{day.total}
                </span>
              </div>
            ))}
          </div>
        </FitnessCard>
      </section>
    </div>
  );
}
