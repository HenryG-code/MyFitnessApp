"use client";

import { HabitCompletionChart } from "@/components/charts/habit-completion-chart";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import type {
  DailyHabit,
  HabitKey,
} from "@/src/lib/supabase/database.types";
import {
  ensureHabitRowForDate,
  fetchRecentHabitHistory,
  getDateDaysAgo,
  getDateInputValue,
  toggleHabitField,
} from "@/src/lib/habits/queries";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
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
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";

type HabitCardMeta = {
  key: HabitKey;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type WeeklySummaryPoint = {
  date: string;
  percentage: number;
  completed: number;
  total: number;
};

const habits: HabitCardMeta[] = [
  { key: "sleep_8_hours", label: "Sleep 8 hours", icon: Moon },
  { key: "trained", label: "Trained", icon: Sparkles },
  { key: "walked_10k_steps", label: "Walked 10k steps", icon: TimerReset },
  { key: "ate_healthy", label: "Ate healthy", icon: Salad },
  {
    key: "no_late_food",
    label: "No food 3 hours before bed",
    icon: CalendarDays,
  },
  { key: "limited_alcohol", label: "Limited alcohol", icon: Sprout },
  { key: "clean_environment", label: "Clean environment", icon: Sparkles },
];

const habitCount = habits.length;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function countCompleted(row: DailyHabit | null) {
  if (!row) {
    return 0;
  }

  return habits.filter((habit) => row[habit.key]).length;
}

function getPercentage(completed: number) {
  return Math.round((completed / habitCount) * 100);
}

function getLatestCompletedLabel(row: DailyHabit | null) {
  if (!row) {
    return null;
  }

  return habits
    .slice()
    .reverse()
    .find((habit) => row[habit.key])?.label;
}

function buildWeeklySummary(history: DailyHabit[]) {
  return Array.from({ length: 7 }, (_item, index) => {
    const date = getDateDaysAgo(6 - index);
    const row = history.find((habitRow) => habitRow.habit_date === date);
    const completed = countCompleted(row ?? null);

    return {
      date: formatDate(date),
      percentage: getPercentage(completed),
      completed,
      total: habitCount,
    };
  }) satisfies WeeklySummaryPoint[];
}

export function HabitsTracker() {
  const today = getDateInputValue();
  const [todayRow, setTodayRow] = useState<DailyHabit | null>(null);
  const [history, setHistory] = useState<DailyHabit[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingHabitKey, setUpdatingHabitKey] = useState<HabitKey | null>(
    null
  );

  async function refreshHabits() {
    setError("");

    try {
      const [row, recentHistory] = await Promise.all([
        ensureHabitRowForDate(today),
        fetchRecentHabitHistory(7),
      ]);
      setTodayRow(row);
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

    Promise.all([ensureHabitRowForDate(today), fetchRecentHabitHistory(7)])
      .then(([row, recentHistory]) => {
        if (isMounted) {
          setTodayRow(row);
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

  const completedCount = countCompleted(todayRow);
  const remainingCount = habitCount - completedCount;
  const percentage = getPercentage(completedCount);
  const latestCompletedLabel = getLatestCompletedLabel(todayRow);
  const weeklySummary = buildWeeklySummary(history);

  async function handleToggle(habit: HabitCardMeta) {
    if (!todayRow) {
      return;
    }

    const nextValue = !todayRow[habit.key];
    setError("");
    setNotice("");
    setUpdatingHabitKey(habit.key);

    try {
      const updated = await toggleHabitField(today, habit.key, nextValue);
      setTodayRow(updated);
      setNotice(
        nextValue
          ? `${habit.label} marked complete.`
          : `${habit.label} marked incomplete.`
      );
      await refreshHabits();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update this habit."
      );
    } finally {
      setUpdatingHabitKey(null);
    }
  }

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Habits"
        title="Build the boring magic."
        description="Check off the daily habits that support better training, recovery, and consistency."
        imageSrc={fitnessImages.treadmillRunner}
        imageAlt="Runner training on a treadmill"
        variant="amber"
      />

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
          value={`${percentage}%`}
          detail={`${completedCount} of ${habitCount} habits complete.`}
          icon={<Sprout className="size-5" />}
          tone="teal"
        />
        <MetricCard
          label="Completed"
          value={`${completedCount}`}
          detail="Checked off today."
          icon={<CheckCircle2 className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Remaining"
          value={`${remainingCount}`}
          detail="Still available for a late comeback."
          icon={<ClipboardCheck className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Latest completed"
          value={latestCompletedLabel ?? "--"}
          detail={
            latestCompletedLabel
              ? "Most recent habit checked off today."
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
          ) : todayRow ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {habits.map((habit) => {
                const Icon = habit.icon;
                const isComplete = todayRow[habit.key];

                return (
                  <div
                    key={habit.key}
                    className="rounded-[1.5rem] border border-line bg-white/65 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <span
                          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                            isComplete
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
                            {isComplete ? "Complete" : "Not complete yet"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleToggle(habit)}
                        disabled={updatingHabitKey === habit.key}
                        className={`rounded-2xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${
                          isComplete
                            ? "bg-[#eaf3dd] text-accent-strong hover:bg-stone-100"
                            : "bg-stone-950 text-white hover:bg-accent"
                        }`}
                      >
                        {updatingHabitKey === habit.key
                          ? "Saving..."
                          : isComplete
                            ? "Undo"
                            : "Mark done"}
                      </button>
                    </div>

                    <div className="mt-5 h-3 rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: isComplete ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] bg-[#eaf3dd] p-6">
              <p className="font-display text-xl font-black">
                Today&apos;s habits are getting ready.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Refresh the page if they do not appear in a moment.
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
