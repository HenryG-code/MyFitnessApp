import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  Workout,
  WorkoutExercise,
  WorkoutExerciseInsert,
  WorkoutInsert,
  WorkoutUpdate,
} from "@/src/lib/supabase/database.types";

export type WorkoutExerciseInput = {
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  notes: string | null;
};

export type WorkoutInput = {
  title: string;
  workout_type: string | null;
  started_at: string;
  duration_minutes: number | null;
  notes: string | null;
  exercises: WorkoutExerciseInput[];
};

export type WorkoutListItem = Workout & {
  exercise_count: number;
};

export type WorkoutWithExercises = Workout & {
  exercises: WorkoutExercise[];
};

export async function getAuthenticatedUserId() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to manage workouts.");
  }

  return { supabase, userId: user.id };
}

export async function fetchWorkouts() {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!workouts.length) {
    return [] satisfies WorkoutListItem[];
  }

  const workoutIds = workouts.map((workout) => workout.id);
  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_exercises")
    .select("workout_id")
    .eq("user_id", userId)
    .in("workout_id", workoutIds);

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const counts = new Map<string, number>();
  exercises.forEach((exercise) => {
    counts.set(exercise.workout_id, (counts.get(exercise.workout_id) ?? 0) + 1);
  });

  return workouts.map((workout) => ({
    ...workout,
    exercise_count: counts.get(workout.id) ?? 0,
  })) satisfies WorkoutListItem[];
}

export async function fetchWorkoutWithExercises(id: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { data: workout, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_exercises")
    .select("*")
    .eq("workout_id", id)
    .eq("user_id", userId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  return {
    ...workout,
    exercises,
  } satisfies WorkoutWithExercises;
}

function buildExercisePayloads(
  workoutId: string,
  userId: string,
  exercises: WorkoutExerciseInput[]
) {
  return exercises.map(
    (exercise, index) =>
      ({
        workout_id: workoutId,
        user_id: userId,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        weight_kg: exercise.weight_kg,
        order_index: index,
        notes: exercise.notes,
      }) satisfies WorkoutExerciseInsert
  );
}

export async function createWorkout(input: WorkoutInput) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const workoutPayload: WorkoutInsert = {
    user_id: userId,
    title: input.title,
    workout_type: input.workout_type,
    started_at: input.started_at,
    duration_minutes: input.duration_minutes,
    notes: input.notes,
  };

  const { data: workout, error } = await supabase
    .from("workouts")
    .insert(workoutPayload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (input.exercises.length) {
    const { error: exerciseError } = await supabase
      .from("workout_exercises")
      .insert(buildExercisePayloads(workout.id, userId, input.exercises));

    if (exerciseError) {
      throw new Error(exerciseError.message);
    }
  }

  return workout satisfies Workout;
}

export async function updateWorkout(id: string, input: WorkoutInput) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const workoutPayload: WorkoutUpdate = {
    title: input.title,
    workout_type: input.workout_type,
    started_at: input.started_at,
    duration_minutes: input.duration_minutes,
    notes: input.notes,
  };

  const { data: workout, error } = await supabase
    .from("workouts")
    .update(workoutPayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const { error: deleteError } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("workout_id", id)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (input.exercises.length) {
    const { error: insertError } = await supabase
      .from("workout_exercises")
      .insert(buildExercisePayloads(id, userId, input.exercises));

    if (insertError) {
      throw new Error(insertError.message);
    }
  }

  return workout satisfies Workout;
}

export async function deleteWorkout(id: string) {
  const { supabase, userId } = await getAuthenticatedUserId();
  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}
