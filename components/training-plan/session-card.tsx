"use client";

import { FitnessCard } from "@/components/ui/fitness-card";
import { logTrainingPlanSession } from "@/src/lib/training-plans/log-workout";
import type {
  TrainingPlan,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import { Clock, Dumbbell, Gauge, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SessionCardProps = {
  plan: TrainingPlan;
  session: TrainingSession;
  onLogged?: () => Promise<void> | void;
};

export function SessionCard({ plan, session, onLogged }: SessionCardProps) {
  const [createdWorkoutId, setCreatedWorkoutId] = useState("");
  const [error, setError] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  async function handleLogSession() {
    setError("");
    setCreatedWorkoutId("");
    setIsLogging(true);

    try {
      const workout = await logTrainingPlanSession(plan, session);
      setCreatedWorkoutId(workout.id);
      await onLogged?.();
    } catch (logError) {
      setError(
        logError instanceof Error
          ? logError.message
          : "Could not log this session."
      );
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <FitnessCard className="!p-3 hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:!p-5">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            {session.dayLabel} / {session.sessionType}
          </p>
          <h3 className="mt-1 font-display text-xl font-black sm:mt-2 sm:text-2xl">
            {session.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-black text-muted sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
            <Clock className="size-4" />
            {session.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1.5 text-xs font-black text-soft-yellow sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
            <Gauge className="size-4" />
            {session.intensity}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:mt-5 sm:gap-3">
        {session.exercises.map((exercise) => (
          <div
            key={`${session.dayLabel}-${exercise.name}`}
            className="liftlog-slide-in rounded-xl border border-line/80 bg-white/[0.04] p-3 transition hover:border-accent/35 hover:bg-white/[0.065] sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-stone-950 sm:size-9 sm:rounded-xl">
                <Dumbbell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-black sm:text-lg">
                  {exercise.name}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[0.7rem] font-black text-muted sm:mt-2 sm:text-xs">
                  {exercise.sets ? <span>{exercise.sets} sets</span> : null}
                  {exercise.reps ? <span>{exercise.reps} reps</span> : null}
                  {exercise.duration ? <span>{exercise.duration}</span> : null}
                  {exercise.rest ? <span>Rest {exercise.rest}</span> : null}
                </div>
                {exercise.notes ? (
                  <p className="mt-1.5 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
                    {exercise.notes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 rounded-xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-muted sm:mt-5 sm:rounded-2xl sm:p-4 sm:text-sm sm:leading-6">
        {session.notes}
      </p>

      <div className="mt-3 flex flex-col gap-2.5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <p className="text-xs font-bold text-muted sm:text-sm">
          Use this session as a guide, then log your completed workout.
        </p>
        <button
          type="button"
          onClick={() => void handleLogSession()}
          disabled={isLogging}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-stone-950 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:py-3"
        >
          <Plus className="size-4" />
          {isLogging ? "Logging..." : "Log workout"}
        </button>
      </div>

      {createdWorkoutId ? (
        <div className="liftlog-pop-in mt-4 rounded-2xl border border-accent/30 bg-accent/15 p-4 text-sm font-bold text-soft-yellow">
          Workout logged.{" "}
          <Link
            href={`/workouts/${createdWorkoutId}`}
            className="font-black underline decoration-accent/60 underline-offset-4"
          >
            View workout
          </Link>
        </div>
      ) : null}

      {error ? (
        <p className="liftlog-pop-in mt-4 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm font-bold text-red-100">
          {error}
        </p>
      ) : null}
    </FitnessCard>
  );
}
