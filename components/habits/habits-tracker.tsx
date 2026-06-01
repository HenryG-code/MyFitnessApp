"use client";

import { HabitCompletionChart } from "@/components/charts/habit-completion-chart";
import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import {
  buildHabitChartData,
  buildHabitDaySummary,
  createHabitDefinition,
  ensureDefaultHabits,
  fetchHabitCompletionsForDate,
  fetchRecentHabitCompletions,
  getDateInputValue,
  hideHabitDefinition,
  toggleHabitCompletion,
  updateHabitDefinition,
  type HabitDaySummary,
} from "@/src/lib/habits/queries";
import type {
  HabitCompletion,
  HabitDefinition,
} from "@/src/lib/supabase/database.types";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Sprout,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HabitFormValues = {
  name: string;
  description: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function getInitialFormValues(habit?: HabitDefinition | null): HabitFormValues {
  return {
    name: habit?.name ?? "",
    description: habit?.description ?? "",
  };
}

function getCompletedSet(completions: HabitCompletion[]) {
  return new Set(
    completions
      .filter((completion) => completion.is_completed)
      .map((completion) => completion.habit_id)
  );
}

export function HabitsTracker() {
  const today = getDateInputValue();
  const [definitions, setDefinitions] = useState<HabitDefinition[]>([]);
  const [todayCompletions, setTodayCompletions] = useState<HabitCompletion[]>([]);
  const [recentCompletions, setRecentCompletions] = useState<HabitCompletion[]>(
    []
  );
  const [formValues, setFormValues] = useState<HabitFormValues>(
    getInitialFormValues()
  );
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingHabitId, setSavingHabitId] = useState<string | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const activeDefinitions = useMemo(
    () => definitions.filter((habit) => habit.is_active),
    [definitions]
  );
  const completedHabitIds = useMemo(
    () => getCompletedSet(todayCompletions),
    [todayCompletions]
  );
  const todaySummary = buildHabitDaySummary(
    today,
    activeDefinitions,
    todayCompletions
  );
  const weeklySummary: HabitDaySummary[] = buildHabitChartData(
    activeDefinitions,
    recentCompletions
  );
  const latestCompletedHabit = activeDefinitions
    .slice()
    .reverse()
    .find((habit) => completedHabitIds.has(habit.id));

  async function refreshHabits() {
    setError("");

    try {
      const habitDefinitions = await ensureDefaultHabits();
      const [dateCompletions, recentHistory] = await Promise.all([
        fetchHabitCompletionsForDate(today),
        fetchRecentHabitCompletions(7),
      ]);

      setDefinitions(habitDefinitions);
      setTodayCompletions(dateCompletions);
      setRecentCompletions(recentHistory);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load habits."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  function openCreateForm() {
    setError("");
    setNotice("");
    setEditingHabit(null);
    setFormValues(getInitialFormValues());
    setIsFormOpen(true);
  }

  function openEditForm(habit: HabitDefinition) {
    setError("");
    setNotice("");
    setEditingHabit(habit);
    setFormValues(getInitialFormValues(habit));
    setIsFormOpen(true);
  }

  async function handleSubmitHabit() {
    setError("");
    setNotice("");
    setIsSavingForm(true);

    try {
      if (editingHabit) {
        await updateHabitDefinition(editingHabit.id, {
          name: formValues.name,
          description: formValues.description || null,
        });
        setNotice("Habit updated.");
      } else {
        await createHabitDefinition({
          name: formValues.name,
          description: formValues.description || null,
        });
        setNotice("Habit added.");
      }

      setIsFormOpen(false);
      setEditingHabit(null);
      setFormValues(getInitialFormValues());
      await refreshHabits();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save habit."
      );
    } finally {
      setIsSavingForm(false);
    }
  }

  async function handleToggleHabit(habit: HabitDefinition) {
    const nextValue = !completedHabitIds.has(habit.id);
    setError("");
    setNotice("");
    setSavingHabitId(habit.id);

    try {
      await toggleHabitCompletion(habit.id, today, nextValue);
      setNotice(
        nextValue
          ? `${habit.name} marked complete.`
          : `${habit.name} marked incomplete.`
      );
      await refreshHabits();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update this habit."
      );
    } finally {
      setSavingHabitId(null);
    }
  }

  async function handleHideHabit(habit: HabitDefinition) {
    const confirmed = window.confirm(
      "Hide this habit? It will no longer appear in your daily list."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setSavingHabitId(habit.id);

    try {
      await hideHabitDefinition(habit.id);
      setNotice("Habit hidden.");
      await refreshHabits();
    } catch (hideError) {
      setError(
        hideError instanceof Error ? hideError.message : "Could not hide habit."
      );
    } finally {
      setSavingHabitId(null);
    }
  }

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Habits"
        title="Build your daily routine."
        description="Tap a habit when it is done, add your own routines, and keep the list personal."
        imageSrc={fitnessImages.treadmillRunner}
        imageAlt="Runner training on a treadmill"
        variant="amber"
      >
        <button
          type="button"
          onClick={openCreateForm}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong"
        >
          <Plus className="size-4" />
          Add habit
        </button>
      </HeroPanel>

      {notice ? (
        <p className="liftlog-pop-in rounded-[1.5rem] border border-accent/25 bg-accent/10 p-4 text-sm font-black text-soft-yellow">
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
          label="Today's progress"
          value={`${todaySummary.percentage}%`}
          detail={
            todaySummary.total
              ? `${todaySummary.completed} of ${todaySummary.total} habits complete.`
              : "No active habits yet. Add a habit to start tracking your routine."
          }
          icon={<Sprout className="size-5" />}
          tone="yellow"
        />
        <MetricCard
          label="Completed"
          value={`${todaySummary.completed}`}
          detail="Checked off today."
          icon={<CheckCircle2 className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Remaining"
          value={`${Math.max(todaySummary.total - todaySummary.completed, 0)}`}
          detail="Still available for a late comeback."
          icon={<ClipboardCheck className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Latest completed"
          value={latestCompletedHabit?.name ?? "--"}
          detail={
            latestCompletedHabit
              ? "Most recent habit checked off today."
              : "No completed habits yet today."
          }
          icon={<CalendarDays className="size-5" />}
          tone="yellow"
        />
      </section>

      {isFormOpen ? (
        <FitnessCard className="border-accent/25">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader
              eyebrow={editingHabit ? "Edit habit" : "New habit"}
              title={editingHabit ? "Update routine" : "Add habit"}
            />
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="grid size-10 place-items-center rounded-2xl border border-line bg-white/65 text-muted transition hover:border-accent hover:text-foreground"
              aria-label="Close habit form"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
            <label className="block">
              <span className="text-sm font-black">Habit name</span>
              <input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                placeholder="Stretch for 10 minutes"
                maxLength={60}
              />
            </label>
            <label className="block">
              <span className="text-sm font-black">Description optional</span>
              <input
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                placeholder="Small cue or reason"
                maxLength={160}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSubmitHabit()}
              disabled={isSavingForm}
              className="min-h-12 self-end rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingForm ? "Saving..." : editingHabit ? "Save" : "Add"}
            </button>
          </div>
        </FitnessCard>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <FitnessCard>
          <SectionHeader eyebrow="Today" title={formatDate(today)} />
          {isLoading ? (
            <div className="rounded-[1.5rem] bg-stone-100 p-6 text-sm font-black text-muted">
              Loading today&apos;s habits...
            </div>
          ) : activeDefinitions.length ? (
            <div className="space-y-3">
              {activeDefinitions.map((habit) => {
                const isComplete = completedHabitIds.has(habit.id);
                const isSaving = savingHabitId === habit.id;

                return (
                  <div
                    key={habit.id}
                    className={`rounded-[1.5rem] p-4 shadow-inner shadow-white/[0.02] transition hover:-translate-y-0.5 hover:border-accent/30 ${
                      isComplete
                        ? "liftlog-complete-pulse border border-accent/35 bg-accent/15"
                        : "bg-white/[0.055]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => void handleToggleHabit(habit)}
                        disabled={isSaving}
                        className="flex min-h-16 flex-1 items-center gap-4 text-left disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <span
                          className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                            isComplete
                              ? "liftlog-pop-in bg-accent text-white"
                              : "bg-stone-950 text-sun"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="size-6" />
                          ) : (
                            <Sparkles className="size-5" />
                          )}
                        </span>
                        <span>
                          <span className="block font-display text-xl font-black leading-tight">
                            {habit.name}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted">
                            {habit.description ||
                              (isComplete ? "Complete" : "Tap when done.")}
                          </span>
                        </span>
                      </button>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => void handleToggleHabit(habit)}
                          disabled={isSaving}
                          className={`rounded-2xl px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-70 ${
                            isComplete
                              ? "bg-white/10 text-soft-yellow hover:bg-white/15"
                              : "bg-accent text-white hover:bg-accent-strong"
                          }`}
                        >
                          {isSaving
                            ? "Saving..."
                            : isComplete
                              ? "Undo"
                              : "Mark done"}
                        </button>
                        {!habit.is_default ? (
                          <button
                            type="button"
                            onClick={() => openEditForm(habit)}
                            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/65 px-3 py-2 text-sm font-black text-muted transition hover:border-accent hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleHideHabit(habit)}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/65 px-3 py-2 text-sm font-black text-muted transition hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <EyeOff className="size-4" />
                          Hide
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-6">
              <p className="font-display text-xl font-black">
                No active habits yet.
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Add a habit to start tracking your routine.
              </p>
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white"
              >
                Add habit
              </button>
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
                <span className="font-black">{day.displayDate}</span>
                <span className="font-bold text-muted">
                  {day.total
                    ? `${day.percentage}% - ${day.completed}/${day.total}`
                    : "No active habits"}
                </span>
              </div>
            ))}
          </div>
        </FitnessCard>
      </section>
    </div>
  );
}
