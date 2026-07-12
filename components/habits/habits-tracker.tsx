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
  deleteHabitDefinition,
  ensureDefaultHabits,
  fetchHabitCompletionsForDate,
  fetchRecentHabitCompletions,
  getDateInputValue,
  hideHabitDefinition,
  moveHabitDefinition,
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
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  EyeOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Sprout,
  Trash2,
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
  const [managingHabitId, setManagingHabitId] = useState<string | null>(null);

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
    void Promise.resolve().then(refreshHabits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  function openCreateForm() {
    setError("");
    setNotice("");
    setEditingHabit(null);
    setFormValues(getInitialFormValues());
    setManagingHabitId(null);
    setIsFormOpen(true);
  }

  function openEditForm(habit: HabitDefinition) {
    setError("");
    setNotice("");
    setEditingHabit(habit);
    setFormValues(getInitialFormValues(habit));
    setManagingHabitId(null);
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

  async function handleMoveHabit(habit: HabitDefinition, direction: "up" | "down") {
    setError("");
    setNotice("");
    setSavingHabitId(habit.id);
    setManagingHabitId(null);

    // Optimistic local swap for instant feedback.
    const index = activeDefinitions.findIndex((item) => item.id === habit.id);
    const neighborIndex = direction === "up" ? index - 1 : index + 1;
    const neighbor = activeDefinitions[neighborIndex];

    if (neighbor) {
      setDefinitions((current) => {
        const next = [...current];
        const a = next.findIndex((item) => item.id === habit.id);
        const b = next.findIndex((item) => item.id === neighbor.id);
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
    }

    try {
      await moveHabitDefinition(activeDefinitions, habit.id, direction);
      await refreshHabits();
    } catch (moveError) {
      setError(
        moveError instanceof Error
          ? moveError.message
          : "Could not reorder habits."
      );
      await refreshHabits();
    } finally {
      setSavingHabitId(null);
    }
  }

  async function handleDeleteHabit(habit: HabitDefinition) {
    const confirmed = window.confirm(
      `Permanently delete "${habit.name}" and its completion history? This cannot be undone. (Use Hide to keep the history.)`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setSavingHabitId(habit.id);
    setManagingHabitId(null);

    try {
      await deleteHabitDefinition(habit.id);
      setNotice(`"${habit.name}" deleted.`);
      await refreshHabits();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete habit."
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
    setManagingHabitId(null);

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
    <div className="space-y-3 sm:space-y-5">
      <section className="lf-panel p-3 sm:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="lf-eyebrow">Habits</p>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight">
              Today&apos;s routine
            </h1>
            <p className="mt-1 text-xs leading-5 text-muted">
              Tap a habit to check it off. Manage actions stay inside each card.
            </p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_24px_rgba(240,71,46,0.3)]">
            <Sprout className="size-5" />
          </span>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="lf-press mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white"
        >
          <Plus className="size-4" />
          Add habit
        </button>
      </section>

      <div className="hidden sm:block">
        <HeroPanel
          eyebrow="Habits"
          title="Build your daily routine"
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
      </div>

      {notice ? (
        <p className="liftlog-pop-in rounded-[1.5rem] border border-accent/25 bg-accent/10 p-4 text-sm font-black text-soft-yellow">
          {notice}
        </p>
      ) : null}

      {todaySummary.total > 0 && todaySummary.completed === todaySummary.total ? (
        <p className="liftlog-complete-pulse rounded-[1.5rem] border border-accent/30 bg-gradient-to-r from-accent/20 to-sun/15 p-4 text-sm font-black text-soft-yellow">
          Full routine complete. That is the kind of boring consistency that
          wins.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      <section className="lf-panel p-3 sm:hidden" aria-label="Today's habit progress">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="lf-eyebrow">Today&apos;s progress</p>
            <p className="lf-num mt-1 font-display text-3xl font-black">
              {todaySummary.percentage}%
            </p>
          </div>
          <p className="pb-1 text-xs font-bold text-muted">
            {todaySummary.completed} done · {Math.max(todaySummary.total - todaySummary.completed, 0)} left
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-sun transition-all"
            style={{ width: `${todaySummary.percentage}%` }}
          />
        </div>
      </section>

      <section className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Today's habit completion"
          value={`${todaySummary.percentage}%`}
          detail={
            todaySummary.total
              ? `${todaySummary.completed} of ${todaySummary.total} habits completed.`
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
          detail="Still available today."
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
              eyebrow={editingHabit ? "Edit habit" : "Add habit"}
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

      <section className="grid gap-3 sm:gap-5 xl:grid-cols-[1.35fr_0.9fr]">
        <FitnessCard className="!p-3 sm:!p-5">
          <SectionHeader eyebrow="Today's habits" title={formatDate(today)} />
          {isLoading ? (
            <div className="rounded-[1.5rem] bg-stone-100 p-6 text-sm font-black text-muted">
              Loading today&apos;s habits...
            </div>
          ) : activeDefinitions.length ? (
            <div className="space-y-2">
              {activeDefinitions.map((habit, habitIndex) => {
                const isComplete = completedHabitIds.has(habit.id);
                const isSaving = savingHabitId === habit.id;

                return (
                  <div
                    key={habit.id}
                    className={`rounded-xl p-2.5 shadow-inner shadow-white/[0.02] transition sm:p-3 ${
                      isComplete
                        ? "liftlog-complete-pulse border border-accent/35 bg-accent/15"
                        : "bg-white/[0.055]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleToggleHabit(habit)}
                        disabled={isSaving}
                        aria-pressed={isComplete}
                        className="flex min-h-12 min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-xl transition ${
                            isComplete
                              ? "liftlog-pop-in bg-accent text-white"
                              : "bg-stone-950 text-sun"
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <Sparkles className="size-4" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block truncate font-display text-base font-black leading-tight"
                          >
                            {habit.name}
                          </span>
                          {habit.description ? (
                            <span className="block truncate text-xs leading-5 text-muted">
                              {habit.description}
                            </span>
                          ) : null}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setManagingHabitId((current) =>
                            current === habit.id ? null : habit.id
                          )
                        }
                        aria-expanded={managingHabitId === habit.id}
                        aria-controls={`habit-actions-${habit.id}`}
                        aria-label={`Manage ${habit.name}`}
                        className={`lf-press grid size-11 shrink-0 place-items-center rounded-xl border transition ${
                          managingHabitId === habit.id
                            ? "border-accent bg-accent/15 text-accent-strong"
                            : "border-line text-muted hover:text-foreground"
                        }`}
                      >
                        <MoreHorizontal className="size-5" />
                      </button>
                    </div>

                    {managingHabitId === habit.id ? (
                      <div
                        id={`habit-actions-${habit.id}`}
                        className="mt-2 grid grid-cols-2 gap-1.5 border-t border-line pt-2 sm:grid-cols-5"
                      >
                        <button
                          type="button"
                          onClick={() => void handleMoveHabit(habit, "up")}
                          disabled={isSaving || habitIndex === 0}
                          className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-2 text-xs font-black text-muted disabled:opacity-25"
                        >
                          <ChevronUp className="size-4" />
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleMoveHabit(habit, "down")}
                          disabled={isSaving || habitIndex === activeDefinitions.length - 1}
                          className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-2 text-xs font-black text-muted disabled:opacity-25"
                        >
                          <ChevronDown className="size-4" />
                          Move down
                        </button>
                        {!habit.is_default ? (
                          <button
                            type="button"
                            onClick={() => openEditForm(habit)}
                            className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-2 text-xs font-black text-muted"
                          >
                            <Pencil className="size-4" />
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleHideHabit(habit)}
                          disabled={isSaving}
                          className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.04] px-2 text-xs font-black text-muted disabled:opacity-50"
                        >
                          <EyeOff className="size-4" />
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteHabit(habit)}
                          disabled={isSaving}
                          className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-strain/25 bg-strain/10 px-2 text-xs font-black text-strain disabled:opacity-50"
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </button>
                      </div>
                    ) : null}
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
          <SectionHeader eyebrow="7-day summary" title="Habit completion trend" />
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
