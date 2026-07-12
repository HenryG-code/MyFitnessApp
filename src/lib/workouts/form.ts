import type {
  WorkoutInput,
  WorkoutWithExercises,
} from "@/src/lib/workouts/queries";
import { z } from "zod";

type IssuePath = string | (string | number)[];

type NumberOptions = {
  allowZero?: boolean;
  integerOnly?: boolean;
};

export const workoutTitleSuggestions = [
  "Full body",
  "Upper body",
  "Lower body",
  "Cardio",
  "Mobility",
  "Yoga",
];

function validateOptionalNumber(
  value: string,
  path: IssuePath,
  context: z.RefinementCtx,
  message: string,
  options: NumberOptions = {}
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  const parsed = Number(trimmed);
  const allowZero = options.allowZero ?? true;
  const isBelowMinimum = allowZero ? parsed < 0 : parsed <= 0;

  if (
    !Number.isFinite(parsed) ||
    isBelowMinimum ||
    (options.integerOnly && !Number.isInteger(parsed))
  ) {
    context.addIssue({
      code: "custom",
      message,
      path: Array.isArray(path) ? path : [path],
    });
  }
}

const exerciseSchema = z.object({
  exercise_name: z.string(),
  sets: z.string(),
  reps: z.string(),
  weight: z.string(),
  distance_km: z.string(),
  duration_minutes: z.string(),
  notes: z.string().max(240, "Keep exercise notes under 240 characters."),
});

export const workoutSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters."),
    workout_date: z.string().min(1, "Workout date is required."),
    duration_minutes: z.string(),
    notes: z.string().max(500, "Keep workout notes under 500 characters."),
    exercises: z.array(exerciseSchema),
  })
  .superRefine((values, context) => {
    validateOptionalNumber(
      values.duration_minutes,
      "duration_minutes",
      context,
      "Duration must be positive.",
      { allowZero: false, integerOnly: true }
    );

    values.exercises.forEach((exercise, index) => {
      const hasAnyValue = [
        exercise.exercise_name,
        exercise.sets,
        exercise.reps,
        exercise.weight,
        exercise.distance_km,
        exercise.duration_minutes,
        exercise.notes,
      ].some((value) => value.trim());

      if (!hasAnyValue) {
        return;
      }

      if (!exercise.exercise_name.trim()) {
        context.addIssue({
          code: "custom",
          message: "Exercise name is required.",
          path: ["exercises", index, "exercise_name"],
        });
      }

      validateOptionalNumber(
        exercise.sets,
        ["exercises", index, "sets"],
        context,
        "Sets cannot be negative.",
        { integerOnly: true }
      );
      validateOptionalNumber(
        exercise.reps,
        ["exercises", index, "reps"],
        context,
        "Reps cannot be negative.",
        { integerOnly: true }
      );
      validateOptionalNumber(
        exercise.weight,
        ["exercises", index, "weight"],
        context,
        "Weight cannot be negative."
      );
      validateOptionalNumber(
        exercise.distance_km,
        ["exercises", index, "distance_km"],
        context,
        "Distance cannot be negative."
      );
      validateOptionalNumber(
        exercise.duration_minutes,
        ["exercises", index, "duration_minutes"],
        context,
        "Duration cannot be negative.",
        { integerOnly: true }
      );
    });
  });

export type WorkoutFormValues = z.infer<typeof workoutSchema>;

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getDateInputValue(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function getEmptyExercise() {
  return {
    exercise_name: "",
    sets: "",
    reps: "",
    weight: "",
    distance_km: "",
    duration_minutes: "",
    notes: "",
  };
}

export function getDefaultValues(
  workout?: WorkoutWithExercises
): WorkoutFormValues {
  if (!workout) {
    return {
      title: "",
      workout_date: getDateInputValue(),
      duration_minutes: "",
      notes: "",
      exercises: [getEmptyExercise()],
    };
  }

  return {
    title: workout.title,
    workout_date: workout.workout_date,
    duration_minutes: workout.duration_minutes?.toString() ?? "",
    notes: workout.notes ?? "",
    exercises: workout.exercises.length
      ? workout.exercises.map((exercise) => ({
          exercise_name: exercise.exercise_name,
          sets: exercise.sets?.toString() ?? "",
          reps: exercise.reps?.toString() ?? "",
          weight: exercise.weight?.toString() ?? "",
          distance_km: exercise.distance_km?.toString() ?? "",
          duration_minutes: exercise.duration_minutes?.toString() ?? "",
          notes: exercise.notes ?? "",
        }))
      : [getEmptyExercise()],
  };
}

export function toWorkoutInput(values: WorkoutFormValues): WorkoutInput {
  return {
    title: values.title.trim(),
    workout_date: values.workout_date,
    duration_minutes: parseOptionalNumber(values.duration_minutes),
    notes: normalizeOptionalText(values.notes),
    exercises: values.exercises
      .filter((exercise) => exercise.exercise_name.trim())
      .map((exercise) => ({
        exercise_name: exercise.exercise_name.trim(),
        sets: parseOptionalNumber(exercise.sets),
        reps: parseOptionalNumber(exercise.reps),
        weight: parseOptionalNumber(exercise.weight),
        distance_km: parseOptionalNumber(exercise.distance_km),
        duration_minutes: parseOptionalNumber(exercise.duration_minutes),
        notes: normalizeOptionalText(exercise.notes),
      })),
  };
}
