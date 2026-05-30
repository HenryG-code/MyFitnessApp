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
};

export function SessionCard({ plan, session }: SessionCardProps) {
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
    <FitnessCard className="hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            {session.dayLabel} / {session.sessionType}
          </p>
          <h3 className="mt-2 font-display text-2xl font-black">
            {session.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-black text-muted">
            <Clock className="size-4" />
            {session.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-2 text-sm font-black text-soft-yellow">
            <Gauge className="size-4" />
            {session.intensity}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {session.exercises.map((exercise) => (
          <div
            key={`${session.dayLabel}-${exercise.name}`}
            className="rounded-2xl border border-line/80 bg-white/[0.04] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-white">
                <Dumbbell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-black">
                  {exercise.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-muted">
                  {exercise.sets ? <span>{exercise.sets} sets</span> : null}
                  {exercise.reps ? <span>{exercise.reps} reps</span> : null}
                  {exercise.duration ? <span>{exercise.duration}</span> : null}
                  {exercise.rest ? <span>Rest {exercise.rest}</span> : null}
                </div>
                {exercise.notes ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {exercise.notes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-white/[0.06] p-4 text-sm font-bold leading-6 text-muted">
        {session.notes}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-muted">
          Use this session as a guide, then log your completed workout.
        </p>
        <button
          type="button"
          onClick={() => void handleLogSession()}
          disabled={isLogging}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Plus className="size-4" />
          {isLogging ? "Logging..." : "Log workout"}
        </button>
      </div>

      {createdWorkoutId ? (
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/15 p-4 text-sm font-bold text-soft-yellow">
          Workout logged.{" "}
          <Link
            href={`/workouts/${createdWorkoutId}`}
            className="font-black underline decoration-yellow-200/60 underline-offset-4"
          >
            View workout
          </Link>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm font-bold text-red-100">
          {error}
        </p>
      ) : null}
    </FitnessCard>
  );
}
