"use client";

import { FitnessCard } from "@/components/ui/fitness-card";
import {
  fetchHabitCompletionsForDate,
  fetchHabitDefinitions,
  getDateInputValue,
  toggleHabitCompletion,
} from "@/src/lib/habits/queries";
import type { HabitDefinition } from "@/src/lib/supabase/database.types";
import {
  getWarmUpDuration,
  isGuidedWarmUpHabit,
  type WarmUpMode,
  warmUpRoutines,
} from "@/src/lib/warm-up/routines";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Dumbbell,
  Footprints,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TimerReset,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function getStepPosition(elapsedSeconds: number, durations: number[]) {
  let start = 0;

  for (let index = 0; index < durations.length; index += 1) {
    const end = start + durations[index];
    if (elapsedSeconds < end) {
      return { index, start, end };
    }
    start = end;
  }

  return {
    index: durations.length - 1,
    start: start - durations[durations.length - 1],
    end: start,
  };
}

export function WarmUpPage({ requestedHabitId }: { requestedHabitId?: string }) {
  const [mode, setMode] = useState<WarmUpMode>("run");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [trackedHabit, setTrackedHabit] = useState<HabitDefinition | null>(null);
  const [habitWasComplete, setHabitWasComplete] = useState(false);
  const [habitSaved, setHabitSaved] = useState(false);
  const [isLoadingHabit, setIsLoadingHabit] = useState(true);
  const [error, setError] = useState("");
  const hasMarkedHabit = useRef(false);
  const hasHandledFinish = useRef(false);
  const steps = warmUpRoutines[mode];
  const durations = useMemo(
    () => steps.map((step) => step.durationSeconds),
    [steps]
  );
  const totalSeconds = getWarmUpDuration(steps);
  // Derived from the timer so resets and step jumps clear it automatically.
  const isFinished = totalSeconds > 0 && elapsedSeconds >= totalSeconds;
  const position = getStepPosition(elapsedSeconds, durations);
  const currentStep = steps[position.index];
  const stepRemaining = Math.max(0, position.end - elapsedSeconds);
  const totalRemaining = Math.max(0, totalSeconds - elapsedSeconds);
  const stepProgress =
    ((elapsedSeconds - position.start) / currentStep.durationSeconds) * 100;
  const overallProgress = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  useEffect(() => {
    let isMounted = true;
    const today = getDateInputValue();

    Promise.all([
      fetchHabitDefinitions({ activeOnly: true }),
      fetchHabitCompletionsForDate(today),
    ])
      .then(([habits, completions]) => {
        if (!isMounted) return;
        const habit =
          habits.find(
            (item) => item.id === requestedHabitId && isGuidedWarmUpHabit(item.name)
          ) ?? habits.find((item) => isGuidedWarmUpHabit(item.name)) ?? null;
        const isComplete = Boolean(
          habit &&
            completions.some(
              (completion) =>
                completion.habit_id === habit.id && completion.is_completed
            )
        );

        setTrackedHabit(habit);
        setHabitWasComplete(isComplete);
        setHabitSaved(isComplete);
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not connect this routine to your habit."
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingHabit(false);
      });

    return () => {
      isMounted = false;
    };
  }, [requestedHabitId]);

  useEffect(() => {
    if (!isRunning || isFinished) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => Math.min(totalSeconds, current + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isFinished, isRunning, totalSeconds]);

  useEffect(() => {
    if (!isFinished) {
      hasHandledFinish.current = false;
      return;
    }

    if (hasHandledFinish.current) return;
    hasHandledFinish.current = true;

    if ("vibrate" in navigator) {
      navigator.vibrate([120, 80, 120]);
    }

    if (!trackedHabit || habitWasComplete || hasMarkedHabit.current) return;

    hasMarkedHabit.current = true;
    toggleHabitCompletion(trackedHabit.id, getDateInputValue(), true)
      .then(() => setHabitSaved(true))
      .catch((saveError: unknown) => {
        hasMarkedHabit.current = false;
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Routine finished, but the habit could not be updated."
        );
      });
  }, [habitWasComplete, isFinished, trackedHabit]);

  function changeMode(nextMode: WarmUpMode) {
    if (nextMode === mode) return;
    if (
      elapsedSeconds > 0 &&
      !isFinished &&
      !window.confirm("Switch routines and restart the 10-minute timer?")
    ) {
      return;
    }

    setMode(nextMode);
    setElapsedSeconds(0);
    setIsRunning(false);
  }

  function resetRoutine() {
    setElapsedSeconds(0);
    setIsRunning(false);
    setError("");
  }

  function goToStep(index: number) {
    const nextElapsed = durations
      .slice(0, index)
      .reduce((total, duration) => total + duration, 0);
    setElapsedSeconds(nextElapsed);
  }

  function goNext() {
    if (position.index >= steps.length - 1) {
      setElapsedSeconds(totalSeconds);
      return;
    }
    goToStep(position.index + 1);
  }

  function goPrevious() {
    if (elapsedSeconds - position.start > 5) {
      goToStep(position.index);
      return;
    }
    goToStep(Math.max(0, position.index - 1));
  }

  if (isFinished) {
    return (
      <div className="mx-auto min-w-0 max-w-3xl overflow-x-clip">
        <section className="lf-panel relative overflow-hidden p-5 text-center sm:p-10">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ready/15 to-transparent" />
          <span className="relative mx-auto grid size-20 place-items-center rounded-full bg-ready text-stone-950 shadow-[0_18px_60px_rgba(52,211,153,0.2)]">
            <Check className="size-10" />
          </span>
          <p className="lf-eyebrow relative mt-5 !text-ready">Warm-up complete</p>
          <h1 className="relative mt-1 font-display text-4xl font-black tracking-tight sm:text-6xl">
            Ready to train.
          </h1>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
            Your heart rate is up, your joints have moved through useful ranges,
            and the muscles needed for your {mode === "run" ? "run" : "gym session"} are switched on.
          </p>
          <div className="relative mx-auto mt-5 max-w-md rounded-xl border border-ready/20 bg-ready/10 p-3 text-left">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-5 shrink-0 text-ready" />
              <div className="min-w-0">
                <p className="text-sm font-black">
                  {isLoadingHabit
                    ? "Connecting to your habit…"
                    : habitSaved
                      ? habitWasComplete
                        ? "Your stretch habit was already complete today."
                        : "Stretch for 10 mins marked complete."
                      : "Routine complete."}
                </p>
                <p className="mt-0.5 text-xs leading-5 text-muted">
                  {trackedHabit
                    ? "This completion is saved in your normal habit history."
                    : "Add a habit named “Stretch for 10 mins” to connect future sessions automatically."}
                </p>
              </div>
            </div>
          </div>
          {error ? (
            <p className="relative mx-auto mt-3 max-w-md rounded-xl border border-strain/25 bg-red-50 p-3 text-xs font-bold text-strain">
              {error}
            </p>
          ) : null}
          <div className="relative mt-6 grid gap-2 sm:grid-cols-2">
            <Link
              href={mode === "run" ? "/running-plan" : "/workouts"}
              className="lf-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white"
            >
              {mode === "run" ? <Footprints className="size-4" /> : <Dumbbell className="size-4" />}
              {mode === "run" ? "Go to running coach" : "Go to training"}
            </Link>
            <button
              type="button"
              onClick={resetRoutine}
              className="lf-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 text-sm font-black"
            >
              <RotateCcw className="size-4" />
              Repeat routine
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto min-w-0 max-w-5xl space-y-3 overflow-x-clip sm:space-y-5">
      <section className="lf-panel min-w-0 overflow-hidden p-3 sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <Link
            href="/habits"
            aria-label="Back to habits"
            className="lf-press grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="lf-eyebrow">10-minute dynamic warm-up</p>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight sm:text-4xl">
              Move better before you train.
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted sm:text-sm sm:leading-6">
              Start easy, build gradually, and finish with movements that match
              the session ahead. No equipment needed.
            </p>
          </div>
          <span className="hidden size-14 shrink-0 place-items-center rounded-2xl bg-accent text-white sm:grid">
            <TimerReset className="size-7" />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2" aria-label="Choose training type">
          <button
            type="button"
            onClick={() => changeMode("run")}
            aria-pressed={mode === "run"}
            className={`lf-press flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black ${
              mode === "run"
                ? "border-accent bg-accent text-white"
                : "border-line bg-white/[0.025] text-muted"
            }`}
          >
            <Footprints className="size-4 shrink-0" />
            Before a run
          </button>
          <button
            type="button"
            onClick={() => changeMode("gym")}
            aria-pressed={mode === "gym"}
            className={`lf-press flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black ${
              mode === "gym"
                ? "border-accent bg-accent text-white"
                : "border-line bg-white/[0.025] text-muted"
            }`}
          >
            <Dumbbell className="size-4 shrink-0" />
            Before the gym
          </button>
        </div>
      </section>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] sm:gap-5">
        <FitnessCard className="min-w-0 border-accent/20 !p-3 sm:!p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-accent/10 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider text-accent-strong">
              Move {position.index + 1} of {steps.length}
            </span>
            <span className="lf-num text-xs font-black text-muted">
              {formatTime(totalRemaining)} total left
            </span>
          </div>

          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center">
            <div
              className="relative mx-auto grid size-40 place-items-center rounded-full sm:size-44"
              style={{
                background: `conic-gradient(var(--accent) ${stepProgress}%, rgba(255,255,255,0.055) ${stepProgress}% 100%)`,
              }}
            >
              <div className="grid size-[8.8rem] place-items-center rounded-full bg-card shadow-inner sm:size-[9.6rem]">
                <div className="text-center">
                  <p className="lf-num font-display text-5xl font-black tracking-tight">
                    {formatTime(stepRemaining)}
                  </p>
                  <p className="mt-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-muted">
                    this movement
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-accent-strong">
                {currentStep.focus}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black leading-tight sm:text-3xl">
                {currentStep.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {currentStep.instruction}
              </p>
              <div className="mt-3 rounded-xl bg-white/[0.035] p-3">
                <p className="text-[0.62rem] font-black uppercase tracking-wider text-muted">
                  Make it easier
                </p>
                <p className="mt-1 text-xs leading-5">{currentStep.easierOption}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-sun transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-[3rem_minmax(0,1fr)_3rem] gap-2">
            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous movement"
              className="lf-press grid min-h-12 place-items-center rounded-xl border border-line bg-white/[0.03] text-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsRunning((current) => !current)}
              className="lf-press inline-flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-sm font-black text-white shadow-[0_12px_36px_rgba(240,71,46,0.2)]"
            >
              {isRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
              {isRunning ? "Pause" : elapsedSeconds ? "Continue" : "Start warm-up"}
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next movement"
              className="lf-press grid min-h-12 place-items-center rounded-xl border border-line bg-white/[0.03] text-muted"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </FitnessCard>

        <FitnessCard className="min-w-0 !p-3 sm:!p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="lf-eyebrow">Routine map</p>
              <h2 className="mt-1 font-display text-xl font-black">
                {mode === "run" ? "Run ready" : "Lift ready"}
              </h2>
            </div>
            <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent-strong">
              <Gauge className="size-4" />
            </span>
          </div>
          <div className="mt-3 grid min-w-0 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
            {steps.map((step, index) => {
              const isDone = index < position.index;
              const isCurrent = index === position.index;
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`lf-press flex min-h-11 min-w-0 items-center gap-2.5 rounded-xl border p-2 text-left ${
                    isCurrent
                      ? "border-accent bg-accent/10"
                      : "border-transparent bg-white/[0.025]"
                  }`}
                >
                  <span className={`lf-num grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${isDone ? "bg-ready text-stone-950" : isCurrent ? "bg-accent text-white" : "bg-white/[0.06] text-muted"}`}>
                    {isDone ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black">{step.title}</span>
                    <span className="block truncate text-[0.62rem] text-muted">{step.focus}</span>
                  </span>
                  <span className="lf-num shrink-0 text-[0.62rem] font-black text-muted">1:00</span>
                </button>
              );
            })}
          </div>
        </FitnessCard>
      </div>

      {error ? (
        <p className="rounded-xl border border-strain/25 bg-red-50 p-3 text-xs font-bold text-strain">
          {error}
        </p>
      ) : null}

      <section className="lf-inset flex min-w-0 items-start gap-3 border border-line p-3 sm:p-4">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent-strong" />
        <div className="min-w-0">
          <p className="text-xs font-black">Warm, not exhausted</p>
          <p className="mt-1 text-[0.68rem] leading-5 text-muted sm:text-xs">
            Keep every movement controlled and pain-free. Stop for sharp pain,
            dizziness, or unusual shortness of breath. If you have an injury or
            health condition, use guidance from your clinician or physiotherapist.
          </p>
        </div>
        <CircleAlert className="hidden size-4 shrink-0 text-muted sm:block" />
      </section>
    </div>
  );
}
