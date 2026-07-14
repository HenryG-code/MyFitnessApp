import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type { WorkoutExercise } from "@/src/lib/supabase/database.types";

export type ExercisePerformance = {
  exerciseName: string;
  workoutDate: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
};

export function normalizeExerciseName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Last logged performance per exercise name across the user's recent
 * workouts. Used by Workout Mode to show "Previous" targets.
 */
export async function fetchLastPerformanceMap(limitWorkouts = 30) {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("id, workout_date")
    .eq("user_id", user.id)
    .order("workout_date", { ascending: false })
    .limit(limitWorkouts);

  if (error) {
    throw new Error(error.message);
  }

  if (!workouts.length) {
    return new Map<string, ExercisePerformance>();
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_exercises")
    .select("*")
    .in(
      "workout_id",
      workouts.map((workout) => workout.id)
    );

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const dateByWorkout = new Map(
    workouts.map((workout) => [workout.id, workout.workout_date])
  );
  const map = new Map<string, ExercisePerformance>();

  (exercises as WorkoutExercise[]).forEach((exercise) => {
    const key = normalizeExerciseName(exercise.exercise_name);
    const workoutDate = dateByWorkout.get(exercise.workout_id) ?? "";
    const existing = map.get(key);

    if (!existing || workoutDate > existing.workoutDate) {
      map.set(key, {
        exerciseName: exercise.exercise_name,
        workoutDate,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
      });
    }
  });

  return map;
}

/** Conservative rep-based 1RM projection, capped by Epley for light loads. */
export function estimateOneRepMax(weight: number | null, reps: number | null) {
  if (
    weight === null ||
    !Number.isFinite(weight) ||
    weight <= 0 ||
    reps === null ||
    !Number.isFinite(reps) ||
    reps <= 0
  ) {
    return null;
  }

  const usedReps = Math.min(Math.max(Math.round(reps), 1), 12);
  if (usedReps === 1) {
    return Math.round(weight * 2) / 2;
  }

  const repBasedEstimate = weight + usedReps;
  const epleyCeiling = weight * (1 + usedReps / 30);
  return Math.round(Math.min(repBasedEstimate, epleyCeiling) * 2) / 2;
}
