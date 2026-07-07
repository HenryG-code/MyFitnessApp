"use client";

import { WorkoutForm } from "@/components/forms/workout-form";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import {
  fetchWorkoutWithExercises,
  type WorkoutWithExercises,
} from "@/src/lib/workouts/queries";
import { ArrowLeft, Clock, Dumbbell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type WorkoutDetailProps = {
  workoutId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function WorkoutDetail({ workoutId }: WorkoutDetailProps) {
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchWorkoutWithExercises(workoutId)
      .then((data) => {
        if (isMounted) {
          setWorkout(data);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load workout."
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
  }, [workoutId]);

  if (isLoading) {
    return (
      <FitnessCard>
        <p className="text-sm font-black text-muted">Loading workout...</p>
      </FitnessCard>
    );
  }

  if (error || !workout) {
    return (
      <div className="space-y-5">
        <Link
          href="/workouts"
          className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white"
        >
          <ArrowLeft className="size-4" />
          Back to workouts
        </Link>
        <FitnessCard>
          <SectionHeader eyebrow="Workout" title="Could not load workout" />
          <p className="text-sm leading-6 text-red-700">
            {error || "This workout was not found."}
          </p>
        </FitnessCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        href="/workouts"
        className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white"
      >
        <ArrowLeft className="size-4" />
        Back to workouts
      </Link>

      <section className="rounded-[1.25rem] border border-line/80 bg-stone-950 p-4 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
          Workout details
        </p>
        <h1 className="mt-1.5 font-display text-2xl font-black tracking-tight sm:text-3xl">
          {workout.title}
        </h1>
        <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-stone-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <Dumbbell className="size-4" />
            Workout
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            <Clock className="size-4" />
            {formatDate(workout.workout_date)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
            {workout.duration_minutes ?? 0} min
          </span>
        </div>
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="Edit" title="Workout and exercises" />
        <WorkoutForm mode="edit" workout={workout} />
      </FitnessCard>
    </div>
  );
}
