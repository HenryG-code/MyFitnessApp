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
import { isGuidedWarmUpHabit } from "@/src/lib/warm-up/routines";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
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
import Link from "next/link";
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
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

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
    <div className="min-w-0 max-w-full space-y-3 overflow-x-clip sm:space-y-5">
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
        <p
          className="liftlog-pop-in rounded-xl border border-accent/25 bg-accent/10 p-3 text-sm font-black text-soft-yellow sm:rounded-[1.5rem] sm:p-4"
          role="status"
          aria-live="polite"
        >
          {notice}
        </p>
      ) : null}

      {todaySummary.total > 0 && todaySummary.completed === todaySummary.total ? (
        <p
          className="liftlog-complete-pulse rounded-xl border border-accent/30 bg-gradient-to-r from-accent/20 to-sun/15 p-3 text-sm font-black text-soft-yellow sm:rounded-[1.5rem] sm:p-4"
          role="status"
        >
          Full routine complete. That is the kind of boring consistency that
          wins.
        </p>
      ) : null}

      {error ? (
        <p
          className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-black text-red-700 sm:rounded-[1.5rem] sm:p-4"
          role="alert"
        >
          {error}
        </p>
      ) : null}

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
        <FitnessCard className="min-w-0 border-accent/25 !p-3 sm:!p-5">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader
              eyebrow={editingHabit ? "Edit habit" : "Add habit"}
              title={editingHabit ? "Update routine" : "Add habit"}
            />
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="grid size-9 place-items-center rounded-xl border border-line bg-white/65 text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:size-10 sm:rounded-2xl"
              aria-label="Close habit form"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3 md:grid-cols-[1fr_1.4fr_auto]">
            <label className="block">
              <span className="text-xs font-black sm:text-sm">Habit name</span>
              <input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:mt-2 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                placeholder="Stretch for 10 minutes"
                maxLength={60}
              />
            </label>
            <label className="block">
              <span className="text-xs font-black sm:text-sm">Description optional</span>
              <input
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:mt-2 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
                placeholder="Small cue or reason"
                maxLength={160}
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSubmitHabit()}
              disabled={isSavingForm}
              className="min-h-11 self-end rounded-xl bg-accent px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-12 sm:rounded-2xl sm:py-3"
            >
              {isSavingForm ? "Saving..." : editingHabit ? "Save" : "Add"}
            </button>
          </div>
        </FitnessCard>
      ) : null}

      <section className="grid min-w-0 gap-3 sm:gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        <FitnessCard className="min-w-0 overflow-hidden !p-2.5 sm:!p-5">
          <div className="mb-2 flex min-w-0 items-start justify-between gap-2 sm:hidden">
            <div className="min-w-0">
              <p className="lf-eyebrow">Habits</p>
              <h1 className="mt-0.5 truncate font-display text-xl font-black tracking-tight">
                Today&apos;s routine
              </h1>
              <p className="text-[0.7rem] font-bold text-muted">
                {formatDate(today)}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateForm}
              className="lf-press grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_24px_rgba(240,71,46,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Add habit"
            >
              <Plus className="size-5" />
            </button>
          </div>

          <div className="hidden sm:block">
            <SectionHeader eyebrow="Today's habits" title={formatDate(today)} />
          </div>

          <div
            className="mb-2 rounded-xl border border-line bg-white/[0.035] px-2.5 py-2 sm:hidden"
            role="progressbar"
            aria-label="Today's habit progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={todaySummary.percentage}
          >
            <div className="flex min-w-0 items-center justify-between gap-2 text-[0.7rem] font-black">
              <span className="min-w-0 truncate text-muted">
                {todaySummary.completed}/{todaySummary.total} complete
              </span>
              <span className="lf-num shrink-0 text-accent-strong">
                {todaySummary.percentage}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-sun transition-all"
                style={{ width: `${todaySummary.percentage}%` }}
              />
            </div>
          </div>

          {isLoading ? (
            <div
              className="rounded-xl bg-stone-100 p-3 text-sm font-black text-muted sm:rounded-[1.5rem] sm:p-6"
              role="status"
            >
              Loading today&apos;s habits...
            </div>
          ) : activeDefinitions.length ? (
            <div className="min-w-0 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/[0.02] sm:space-y-2 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent">
              {activeDefinitions.map((habit, habitIndex) => {
                const isComplete = completedHabitIds.has(habit.id);
                const isSaving = savingHabitId === habit.id;
                const hasGuidedWarmUp = isGuidedWarmUpHabit(habit.name);

                return (
                  <div
                    key={habit.id}
                    className={`min-w-0 overflow-hidden px-2 py-1.5 transition sm:rounded-xl sm:p-3 sm:shadow-inner sm:shadow-white/[0.02] ${
                      isComplete
                        ? "liftlog-complete-pulse bg-accent/15 ring-1 ring-inset ring-accent/35"
                        : "sm:bg-white/[0.055]"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                      {hasGuidedWarmUp ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleToggleHabit(habit)}
                            disabled={isSaving}
                            aria-pressed={isComplete}
                            aria-label={
                              isComplete
                                ? `Mark ${habit.name} incomplete`
                                : `Mark ${habit.name} complete`
                            }
                            className={`lf-press grid size-11 shrink-0 place-items-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70 ${
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
                          </button>
                          <Link
                            href={`/warm-up?habitId=${habit.id}`}
                            className="lf-press flex min-h-11 min-w-0 flex-1 items-center gap-1 rounded-xl px-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:min-h-12 sm:gap-2"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-sm font-black leading-tight sm:text-base">
                                {habit.name}
                              </span>
                              <span className="mt-0.5 block truncate text-[0.65rem] font-black uppercase leading-4 tracking-wider text-accent-strong sm:mt-1">
                                Guided warm-up
                              </span>
                            </span>
                            <ChevronRight className="size-4 shrink-0 text-accent-strong" />
                          </Link>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleToggleHabit(habit)}
                          disabled={isSaving}
                          aria-pressed={isComplete}
                          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-12 sm:gap-3"
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
                          <span className="min-w-0 flex-1">
                            <span
                              className="block truncate font-display text-sm font-black leading-tight sm:text-base"
                            >
                              {habit.name}
                            </span>
                            {habit.description ? (
                              <span className="block truncate text-[0.7rem] leading-4 text-muted sm:text-xs sm:leading-5">
                                {habit.description}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      )}
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
                        className={`lf-press grid size-11 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
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
                        className="mt-1.5 grid min-w-0 grid-cols-3 gap-1 border-t border-line pt-1.5 sm:mt-2 sm:grid-cols-5 sm:gap-1.5 sm:pt-2"
                      >
                        <button
                          type="button"
                          onClick={() => void handleMoveHabit(habit, "up")}
                          disabled={isSaving || habitIndex === 0}
                          aria-label={`Move ${habit.name} up`}
                          className="lf-press inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-1 text-[0.7rem] font-black text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-25 sm:rounded-xl sm:px-1.5 sm:text-xs"
                        >
                          <ChevronUp className="size-4" />
                          <span className="sm:hidden">Up</span>
                          <span className="hidden sm:inline">Move up</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleMoveHabit(habit, "down")}
                          disabled={isSaving || habitIndex === activeDefinitions.length - 1}
                          aria-label={`Move ${habit.name} down`}
                          className="lf-press inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-1 text-[0.7rem] font-black text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-25 sm:rounded-xl sm:px-1.5 sm:text-xs"
                        >
                          <ChevronDown className="size-4" />
                          <span className="sm:hidden">Down</span>
                          <span className="hidden sm:inline">Move down</span>
                        </button>
                        {!habit.is_default ? (
                          <button
                            type="button"
                            onClick={() => openEditForm(habit)}
                            aria-label={`Edit ${habit.name}`}
                            className="lf-press inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-1 text-[0.7rem] font-black text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:rounded-xl sm:px-1.5 sm:text-xs"
                          >
                            <Pencil className="size-4" />
                            Edit
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void handleHideHabit(habit)}
                          disabled={isSaving}
                          aria-label={`Hide ${habit.name}`}
                          className="lf-press inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-1 text-[0.7rem] font-black text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 sm:rounded-xl sm:px-1.5 sm:text-xs"
                        >
                          <EyeOff className="size-4" />
                          Hide
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteHabit(habit)}
                          disabled={isSaving}
                          aria-label={`Delete ${habit.name}`}
                          className="lf-press inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg border border-strain/25 bg-strain/10 px-1 text-[0.7rem] font-black text-strain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-strain disabled:opacity-50 sm:rounded-xl sm:px-1.5 sm:text-xs"
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
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-4 sm:rounded-[1.5rem] sm:p-6">
              <p className="font-display text-lg font-black sm:text-xl">
                No active habits yet.
              </p>
              <p className="mt-1 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
                Add a habit to start tracking your routine.
              </p>
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:mt-5 sm:rounded-2xl sm:px-5 sm:py-3"
              >
                Add habit
              </button>
            </div>
          )}
        </FitnessCard>

        <FitnessCard className="min-w-0 overflow-hidden !p-0 sm:!p-5">
          <div className="sm:hidden">
            <button
              type="button"
              onClick={() => setIsWeeklySummaryOpen((current) => !current)}
              aria-expanded={isWeeklySummaryOpen}
              aria-controls="mobile-weekly-habit-summary"
              className="lf-press flex min-h-12 w-full min-w-0 items-center justify-between gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            >
              <span className="min-w-0">
                <span className="lf-eyebrow block">7-day summary</span>
                <span className="block truncate font-display text-base font-black">
                  Completion trend
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="lf-num text-xs font-black text-accent-strong">
                  {todaySummary.percentage}% today
                </span>
                <ChevronDown
                  className={`size-4 transition-transform ${
                    isWeeklySummaryOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {isWeeklySummaryOpen ? (
              <div
                id="mobile-weekly-habit-summary"
                className="border-t border-line px-2.5 pb-2.5 pt-2"
              >
                {isLoading ? (
                  <div
                    className="grid h-36 place-items-center rounded-xl bg-stone-100 text-sm font-black text-muted"
                    role="status"
                  >
                    Loading summary...
                  </div>
                ) : (
                  <HabitCompletionChart data={weeklySummary} compact />
                )}
                <div className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white/[0.025]">
                  {weeklySummary.map((day) => (
                    <div
                      key={day.date}
                      className="flex min-w-0 items-center justify-between gap-2 px-2.5 py-2 text-xs"
                    >
                      <span className="min-w-0 truncate font-black">
                        {day.displayDate}
                      </span>
                      <span className="min-w-0 truncate text-right text-[0.7rem] font-bold text-muted">
                        {day.total
                          ? `${day.percentage}% · ${day.completed}/${day.total}`
                          : "No active habits"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden sm:block">
            <SectionHeader
              eyebrow="7-day summary"
              title="Habit completion trend"
            />
            {isLoading ? (
              <div
                className="grid h-64 place-items-center rounded-[1.5rem] bg-stone-100 text-sm font-black text-muted"
                role="status"
              >
                Loading summary...
              </div>
            ) : (
              <HabitCompletionChart data={weeklySummary} />
            )}
            <div className="mt-4 space-y-2">
              {weeklySummary.map((day) => (
                <div
                  key={day.date}
                  className="flex min-w-0 items-center justify-between gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm"
                >
                  <span className="min-w-0 font-black">{day.displayDate}</span>
                  <span className="min-w-0 text-right text-sm font-bold text-muted">
                    {day.total
                      ? `${day.percentage}% - ${day.completed}/${day.total}`
                      : "No active habits"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FitnessCard>
      </section>
    </div>
  );
}
