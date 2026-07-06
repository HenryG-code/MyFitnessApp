"use client";

import { getDateInputValue } from "@/src/lib/habits/queries";
import {
  fetchLastPerformanceMap,
  normalizeExerciseName,
  type ExercisePerformance,
} from "@/src/lib/performance/history";
import { createWorkout } from "@/src/lib/workouts/queries";
import {
  defaultTrainingGoal,
  getTrainingPlanByGoal,
} from "@/src/lib/training-plans/data";
import { isTrainingGoal } from "@/src/lib/training-plans/storage";
import type {
  TrainingExercise,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import { Check, ChevronRight, Minus, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LoggedSet = { weight: number | null; reps: number | null };

type QueueExercise = {
  name: string;
  targetSets: number;
  targetReps: number | null;
  restSeconds: number;
  timed: boolean;
  durationMinutes: number | null;
  notes?: string;
  logged: LoggedSet[];
  skipped: boolean;
};

function parseFirstNumber(value: string | undefined) {
  const match = value?.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function buildQueue(session: TrainingSession): QueueExercise[] {
  return session.exercises.map((exercise: TrainingExercise) => {
    const timed = !exercise.sets && !exercise.reps && Boolean(exercise.duration);

    return {
      name: exercise.name,
      targetSets: timed ? 1 : (exercise.sets ?? 3),
      targetReps: parseFirstNumber(exercise.reps),
      restSeconds: parseFirstNumber(exercise.rest) ?? 75,
      timed,
      durationMinutes: parseFirstNumber(exercise.duration),
      notes: exercise.notes,
      logged: [],
      skipped: false,
    };
  });
}

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function Stepper({
  label,
  value,
  display,
  onChange,
  step,
  inputMode,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (next: number) => void;
  step: number;
  inputMode: "decimal" | "numeric";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const parsed = Number(draft.replace(",", "."));
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChange(parsed);
    }
    setEditing(false);
  }

  return (
    <div className="lf-inset flex flex-1 flex-col items-center px-2 py-3">
      <p className="lf-eyebrow !text-[0.6rem]">{label}</p>
      <div className="mt-1.5 flex w-full items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - step))}
          className="lf-press grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
        {editing ? (
          <input
            autoFocus
            inputMode={inputMode}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commit();
              }
            }}
            aria-label={label}
            className="lf-num w-16 rounded-lg border border-accent/50 bg-transparent py-1 text-center font-display text-2xl font-black outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            aria-label={`Edit ${label}`}
            className="lf-num min-w-0 truncate px-1 font-display text-[1.7rem] font-black leading-none"
          >
            {display}
          </button>
        )}
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="lf-press grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function WorkoutMode() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { session, goal } = useMemo(() => {
    const goalParam = searchParams.get("goal");
    const resolvedGoal = isTrainingGoal(goalParam)
      ? goalParam
      : defaultTrainingGoal;
    const plan = getTrainingPlanByGoal(resolvedGoal);
    const index = Math.min(
      Math.max(Number(searchParams.get("session")) || 0, 0),
      plan.days.length - 1
    );

    return { session: plan.days[index], goal: resolvedGoal };
  }, [searchParams]);

  const [queue, setQueue] = useState<QueueExercise[]>(() =>
    buildQueue(session)
  );
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);
  const [resting, setResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [flash, setFlash] = useState<string | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [previousMap, setPreviousMap] = useState<Map<
    string,
    ExercisePerformance
  > | null>(null);
  const startRef = useRef<number | null>(null);
  const initializedRef = useRef<number | null>(null);

  const current = queue[exerciseIndex] as QueueExercise | undefined;
  const previous = current
    ? (previousMap?.get(normalizeExerciseName(current.name)) ?? null)
    : null;

  // Elapsed session clock.
  useEffect(() => {
    startRef.current ??= Date.now();
    const id = window.setInterval(() => {
      setElapsed(
        Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000)
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Rest countdown.
  useEffect(() => {
    if (!resting) {
      return;
    }

    const id = window.setInterval(() => {
      setRestRemaining((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(id);
          setResting(false);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [resting]);

  // Previous performance.
  useEffect(() => {
    fetchLastPerformanceMap()
      .then(setPreviousMap)
      .catch(() => setPreviousMap(new Map()));
  }, []);

  // Seed steppers when the exercise changes (once per exercise, after history loads).
  useEffect(() => {
    if (!current || initializedRef.current === exerciseIndex || !previousMap) {
      return;
    }

    initializedRef.current = exerciseIndex;
    const prior = previousMap.get(normalizeExerciseName(current.name));
    setWeight(prior?.weight ?? 20);
    setReps(prior?.reps ?? current.targetReps ?? 8);
  }, [current, exerciseIndex, previousMap]);

  const advance = useCallback(
    (nextQueue: QueueExercise[]) => {
      const nextIndex = nextQueue.findIndex(
        (exercise, index) =>
          index > exerciseIndex &&
          !exercise.skipped &&
          exercise.logged.length < exercise.targetSets
      );

      if (nextIndex === -1) {
        setFinished(true);
      } else {
        setExerciseIndex(nextIndex);
      }
    },
    [exerciseIndex]
  );

  function logSet() {
    if (!current) {
      return;
    }

    const entry: LoggedSet = current.timed
      ? { weight: null, reps: null }
      : { weight, reps };
    const nextQueue = queue.map((exercise, index) =>
      index === exerciseIndex
        ? { ...exercise, logged: [...exercise.logged, entry] }
        : exercise
    );
    setQueue(nextQueue);

    // Progress feedback vs previous session.
    if (!current.timed && previous?.weight && weight > 0) {
      const delta = ((weight - previous.weight) / previous.weight) * 100;
      if (Math.abs(delta) >= 0.5) {
        setFlash(
          `${delta > 0 ? "+" : ""}${delta.toFixed(1)}% vs last session`
        );
      } else {
        setFlash("Matched last session");
      }
      window.setTimeout(() => setFlash(null), 1500);
    }

    const done = nextQueue[exerciseIndex].logged.length;

    if (done >= current.targetSets) {
      advance(nextQueue);
    } else if (!current.timed) {
      setRestRemaining(current.restSeconds);
      setResting(true);
    }
  }

  function skipExercise() {
    const nextQueue = queue.map((exercise, index) =>
      index === exerciseIndex ? { ...exercise, skipped: true } : exercise
    );
    setQueue(nextQueue);
    setResting(false);
    advance(nextQueue);
  }

  async function saveWorkout() {
    setSaving(true);
    setSaveError("");

    const performed = queue.filter((exercise) => exercise.logged.length > 0);

    try {
      await createWorkout({
        title: session.title,
        workout_date: getDateInputValue(),
        duration_minutes: Math.max(1, Math.round(elapsed / 60)),
        notes: `LogFit Workout Mode — ${goal} plan.`,
        exercises: performed.map((exercise) => {
          const weights = exercise.logged
            .map((set) => set.weight)
            .filter((value): value is number => value !== null && value > 0);
          const repsLogged = exercise.logged
            .map((set) => set.reps)
            .filter((value): value is number => value !== null && value > 0);
          const breakdown = exercise.logged
            .map((set) =>
              set.weight !== null && set.reps !== null
                ? `${set.weight}kg×${set.reps}`
                : "done"
            )
            .join(", ");

          return {
            exercise_name: exercise.name,
            sets: exercise.logged.length,
            reps: repsLogged.length
              ? repsLogged[repsLogged.length - 1]
              : null,
            weight: weights.length ? Math.max(...weights) : null,
            distance_km: null,
            duration_minutes: exercise.timed ? exercise.durationMinutes : null,
            notes: exercise.timed ? null : `Sets: ${breakdown}`,
          };
        }),
      });

      router.push("/dashboard");
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save the workout."
      );
      setSaving(false);
    }
  }

  const totalSetsLogged = queue.reduce(
    (sum, exercise) => sum + exercise.logged.length,
    0
  );
  const totalVolume = Math.round(
    queue.reduce(
      (sum, exercise) =>
        sum +
        exercise.logged.reduce(
          (setSum, set) => setSum + (set.weight ?? 0) * (set.reps ?? 0),
          0
        ),
      0
    )
  );

  // ——— Finish screen ———
  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-8">
          <div className="lf-rise text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full border border-ready/30 bg-ready/10 text-ready">
              <Check className="size-8" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-black tracking-tight">
              Session complete
            </h1>
            <p className="mt-1 text-sm text-muted">{session.title}</p>
          </div>
          <div className="lf-rise lf-rise-1 mt-6 grid grid-cols-3 gap-2">
            {[
              { label: "Time", value: formatClock(elapsed) },
              { label: "Sets", value: `${totalSetsLogged}` },
              {
                label: "Volume",
                value: totalVolume > 0 ? `${totalVolume} kg` : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="lf-inset p-3 text-center">
                <p className="lf-eyebrow !text-[0.6rem]">{stat.label}</p>
                <p className="lf-num mt-1 font-display text-xl font-black">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          {saveError ? (
            <p className="mt-4 rounded-xl border border-strain/30 bg-strain/10 p-3 text-sm font-bold text-strain">
              {saveError}
            </p>
          ) : null}
          <div className="lf-rise lf-rise-2 mt-6 space-y-2">
            <button
              type="button"
              disabled={saving || totalSetsLogged === 0}
              onClick={saveWorkout}
              className="lf-press flex h-[3.25rem] w-full items-center justify-center rounded-xl bg-accent text-[0.95rem] font-black tracking-wide text-white shadow-[0_10px_30px_rgba(240,71,46,0.35)] transition hover:bg-accent-strong disabled:opacity-50"
            >
              {saving ? "Saving…" : "SAVE WORKOUT"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="lf-press w-full rounded-xl py-3 text-sm font-bold text-muted transition hover:text-foreground"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const setNumber = current.logged.length + 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 pb-1 pt-4">
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          aria-label="Exit workout"
          className="lf-press grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="flex items-center gap-1.5" aria-label="Exercise progress">
          {queue.map((exercise, index) => (
            <span
              key={`${exercise.name}-${index}`}
              className={`h-1 rounded-full transition-all ${
                index === exerciseIndex
                  ? "w-6 bg-accent"
                  : exercise.logged.length >= exercise.targetSets ||
                      exercise.skipped
                    ? "w-2.5 bg-ready/70"
                    : "w-2.5 bg-white/[0.12]"
              }`}
            />
          ))}
        </div>
        <p className="lf-num w-14 text-right text-sm font-bold text-muted">
          {formatClock(elapsed)}
        </p>
      </div>

      {/* Core */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between px-4 pb-4">
        <div className="pt-3">
          <p className="lf-eyebrow text-accent-strong">
            {current.timed
              ? (current.durationMinutes ? `${current.durationMinutes} min block` : "Timed block")
              : `Set ${setNumber} of ${current.targetSets}`}
          </p>
          <h1 className="mt-1 font-display text-[1.7rem] font-black leading-tight tracking-tight sm:text-3xl">
            {current.name}
          </h1>
          {current.notes ? (
            <p className="mt-1 text-xs font-semibold text-muted">
              {current.notes}
            </p>
          ) : null}

          {/* Set dots */}
          {!current.timed ? (
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: current.targetSets }).map((_item, index) => (
                <span
                  key={index}
                  className={`grid size-7 place-items-center rounded-full text-[0.65rem] font-black transition ${
                    index < current.logged.length
                      ? "lf-tick bg-ready/15 text-ready"
                      : index === current.logged.length
                        ? "border border-accent/60 text-accent-strong"
                        : "border border-line text-ink-dim"
                  }`}
                >
                  {index < current.logged.length ? (
                    <Check className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
              ))}
            </div>
          ) : null}

          {/* Previous / Target */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="lf-inset p-3">
              <p className="lf-eyebrow !text-[0.6rem]">Previous</p>
              <p className="lf-num mt-1 text-sm font-black">
                {previous?.weight
                  ? `${previous.weight} kg × ${previous.reps ?? "—"}`
                  : previousMap
                    ? "First time"
                    : "…"}
              </p>
            </div>
            <div className="lf-inset p-3">
              <p className="lf-eyebrow !text-[0.6rem]">Target</p>
              <p className="lf-num mt-1 text-sm font-black">
                {current.timed
                  ? (current.durationMinutes ? `${current.durationMinutes} min` : "Complete")
                  : `${current.targetSets} × ${current.targetReps ?? "—"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action zone */}
        <div className="relative">
          {flash ? (
            <p
              className={`lf-flash pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-black ${
                flash.startsWith("+")
                  ? "bg-ready/15 text-ready"
                  : "bg-white/[0.08] text-foreground"
              }`}
              role="status"
            >
              {flash}
            </p>
          ) : null}

          {resting ? (
            <div className="lf-fade lf-panel p-4 text-center">
              <p className="lf-eyebrow">Rest</p>
              <p className="lf-num mt-1 font-display text-5xl font-black tabular-nums">
                {formatClock(restRemaining)}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(restRemaining / Math.max(current.restSeconds, 1)) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRestRemaining((value) => value + 15)}
                  className="lf-press rounded-xl border border-line py-3 text-sm font-bold text-muted transition hover:text-foreground"
                >
                  +15s
                </button>
                <button
                  type="button"
                  onClick={() => setResting(false)}
                  className="lf-press rounded-xl bg-white/[0.08] py-3 text-sm font-black transition hover:bg-white/[0.14]"
                >
                  Skip rest
                </button>
              </div>
            </div>
          ) : (
            <>
              {!current.timed ? (
                <div className="flex gap-2">
                  <Stepper
                    label="Weight · kg"
                    value={weight}
                    display={
                      weight % 1 === 0 ? String(weight) : weight.toFixed(1)
                    }
                    onChange={setWeight}
                    step={2.5}
                    inputMode="decimal"
                  />
                  <Stepper
                    label="Reps"
                    value={reps}
                    display={String(reps)}
                    onChange={(next) => setReps(Math.round(next))}
                    step={1}
                    inputMode="numeric"
                  />
                </div>
              ) : null}

              <button
                type="button"
                onClick={logSet}
                className="lf-press mt-2 flex h-[3.5rem] w-full items-center justify-center gap-2 rounded-xl bg-accent text-base font-black tracking-wide text-white shadow-[0_10px_30px_rgba(240,71,46,0.35)] transition hover:bg-accent-strong"
              >
                {current.timed ? "MARK DONE" : "LOG SET"}
              </button>
            </>
          )}

          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={skipExercise}
              className="lf-press py-2 text-xs font-bold text-muted transition hover:text-foreground"
            >
              Skip exercise
            </button>
            <button
              type="button"
              onClick={() => setFinished(true)}
              className="lf-press flex items-center gap-1 py-2 text-xs font-bold text-muted transition hover:text-foreground"
            >
              Finish workout
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exit confirm */}
      {confirmExit ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center">
          <div className="lf-sheet lf-panel m-3 w-full max-w-sm p-5">
            <h2 className="font-display text-xl font-black">Leave workout?</h2>
            <p className="mt-1 text-sm text-muted">
              {totalSetsLogged > 0
                ? `${totalSetsLogged} logged set${totalSetsLogged === 1 ? "" : "s"} will be discarded.`
                : "Nothing has been logged yet."}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="lf-press rounded-xl bg-white/[0.08] py-3 text-sm font-black transition hover:bg-white/[0.14]"
              >
                Keep training
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="lf-press rounded-xl border border-strain/40 py-3 text-sm font-bold text-strain"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
