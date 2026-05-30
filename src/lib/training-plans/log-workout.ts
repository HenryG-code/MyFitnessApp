import {
  createWorkout,
  type WorkoutExerciseInput,
} from "@/src/lib/workouts/queries";
import type {
  TrainingExercise,
  TrainingPlan,
  TrainingSession,
} from "@/src/lib/training-plans/types";

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseSimpleInteger(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

function parseSimpleMinutes(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d+)\s*(min|mins|minute|minutes)$/i);
  return match ? Number(match[1]) : null;
}

function buildExerciseNotes(exercise: TrainingExercise) {
  const notes = [
    exercise.notes,
    exercise.reps && parseSimpleInteger(exercise.reps) === null
      ? `Reps: ${exercise.reps}`
      : null,
    exercise.duration && parseSimpleMinutes(exercise.duration) === null
      ? `Duration: ${exercise.duration}`
      : null,
    exercise.rest ? `Rest: ${exercise.rest}` : null,
  ].filter(Boolean);

  return notes.length ? notes.join(" | ") : null;
}

function mapExercise(exercise: TrainingExercise): WorkoutExerciseInput {
  return {
    exercise_name: exercise.name,
    sets: exercise.sets ?? null,
    reps: parseSimpleInteger(exercise.reps),
    weight: null,
    distance_km: null,
    duration_minutes: parseSimpleMinutes(exercise.duration),
    notes: buildExerciseNotes(exercise),
  };
}

export async function logTrainingPlanSession(
  plan: TrainingPlan,
  session: TrainingSession
) {
  return createWorkout({
    title: session.title,
    workout_date: getTodayDateInputValue(),
    duration_minutes: session.durationMinutes,
    notes: `Logged from suggested training plan: ${plan.title} / ${session.title}.`,
    exercises: session.exercises.map(mapExercise),
  });
}
