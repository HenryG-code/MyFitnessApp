"use client";

import {
  createWorkout,
  updateWorkout,
  type WorkoutInput,
  type WorkoutWithExercises,
} from "@/src/lib/workouts/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const exerciseSchema = z.object({
  exercise_name: z.string(),
  sets: z.string(),
  reps: z.string(),
  weight: z.string(),
  distance_km: z.string(),
  duration_minutes: z.string(),
  notes: z.string().max(240, "Keep exercise notes under 240 characters."),
});

const workoutSchema = z
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

type WorkoutFormValues = z.infer<typeof workoutSchema>;

type WorkoutFormProps = {
  mode?: "create" | "edit";
  workout?: WorkoutWithExercises;
};

type IssuePath = string | (string | number)[];

type NumberOptions = {
  allowZero?: boolean;
  integerOnly?: boolean;
};

const workoutTitleSuggestions = [
  "Full Body",
  "Upper Body",
  "Lower Body",
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

function getEmptyExercise() {
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

function getDefaultValues(workout?: WorkoutWithExercises): WorkoutFormValues {
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

function toWorkoutInput(values: WorkoutFormValues): WorkoutInput {
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

export function WorkoutForm({ mode = "create", workout }: WorkoutFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: getDefaultValues(workout),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "exercises",
  });
  const watchedExercises = watch("exercises");

  function addExercise() {
    append(getEmptyExercise());
  }

  function applyTitleSuggestion(title: string) {
    const currentTitle = watch("title").trim();

    if (!currentTitle || window.confirm(`Replace "${currentTitle}" with "${title}"?`)) {
      setValue("title", title, { shouldDirty: true, shouldValidate: true });
    }
  }

  function getExerciseSummary(index: number) {
    const exercise = watchedExercises[index];

    if (!exercise?.exercise_name?.trim()) {
      return "Add exercise details";
    }

    const summaryParts = [
      exercise.sets && exercise.reps
        ? `${exercise.sets} x ${exercise.reps}`
        : null,
      exercise.weight ? `${exercise.weight} kg` : null,
      exercise.duration_minutes ? `${exercise.duration_minutes} min` : null,
    ].filter(Boolean);

    return summaryParts.length ? summaryParts.join(" - ") : "Details optional";
  }

  async function onSubmit(values: WorkoutFormValues) {
    setFormError("");
    setSuccess("");

    try {
      const input = toWorkoutInput(values);

      if (mode === "edit") {
        if (!workout) {
          throw new Error("Missing workout to update.");
        }

        await updateWorkout(workout.id, input);
        setSuccess("Workout updated.");
        router.refresh();
        return;
      }

      const created = await createWorkout(input);
      router.replace(`/workouts/${created.id}`);
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save workout."
      );
    }
  }

  return (
    <form
      className="space-y-4 pb-28 sm:space-y-5 sm:pb-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label className="text-sm font-black" htmlFor="title">
          Workout title
        </label>
        <input
          id="title"
          className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
          placeholder="Upper Body Strength"
          {...register("title")}
        />
        {errors.title ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.title.message}
          </p>
        ) : null}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {workoutTitleSuggestions.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => applyTitleSuggestion(title)}
              className="shrink-0 rounded-full border border-line bg-white/65 px-3 py-2 text-xs font-black text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-black" htmlFor="workout_date">
            Workout date
          </label>
          <input
            id="workout_date"
            type="date"
            className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            {...register("workout_date")}
          />
          {errors.workout_date ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.workout_date.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-black" htmlFor="duration_minutes">
            Duration, minutes
          </label>
          <input
            id="duration_minutes"
            type="number"
            min="1"
            step="1"
            className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            placeholder="45"
            {...register("duration_minutes")}
          />
          {errors.duration_minutes ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.duration_minutes.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-black" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
          placeholder="How did the session feel?"
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] border border-line bg-white/45 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-accent">
              Exercises
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              Add as many rows as you need. Empty rows are ignored.
            </p>
          </div>
          <button
            type="button"
            onClick={addExercise}
            className="hidden items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-accent-strong sm:inline-flex"
          >
            <Plus className="size-4" />
            Add exercise
          </button>
        </div>

        <div className="mt-4 divide-y divide-line rounded-[1.35rem] border border-line bg-card/70">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="liftlog-slide-in relative p-4 transition hover:bg-white/[0.035] sm:p-5"
            >
              <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-accent/80" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 pl-2">
                  <p className="font-display text-lg font-black">
                    Exercise {index + 1}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-muted">
                    {getExerciseSummary(index)}
                  </p>
                </div>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label className="text-sm font-black">Exercise name</label>
                  <input
                    className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    placeholder="Bench press"
                    {...register(`exercises.${index}.exercise_name`)}
                  />
                  {errors.exercises?.[index]?.exercise_name ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.exercise_name?.message}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="text-sm font-black">Sets</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    {...register(`exercises.${index}.sets`)}
                  />
                  {errors.exercises?.[index]?.sets ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.sets?.message}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="text-sm font-black">Reps</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    {...register(`exercises.${index}.reps`)}
                  />
                  {errors.exercises?.[index]?.reps ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.reps?.message}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-2 sm:col-span-2">
                  <label className="text-sm font-black">Weight, kg</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    {...register(`exercises.${index}.weight`)}
                  />
                  {errors.exercises?.[index]?.weight ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.weight?.message}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <label className="text-sm font-black">Distance, km</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    {...register(`exercises.${index}.distance_km`)}
                  />
                  {errors.exercises?.[index]?.distance_km ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.distance_km?.message}
                    </p>
                  ) : null}
                </div>

                <div className="col-span-1 sm:col-span-3">
                  <label className="text-sm font-black">
                    Exercise duration, min
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface/80 px-3 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    {...register(`exercises.${index}.duration_minutes`)}
                  />
                  {errors.exercises?.[index]?.duration_minutes ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.duration_minutes?.message}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-6">
                  <label className="text-sm font-black">Exercise notes</label>
                  <textarea
                    rows={2}
                    className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-2.5 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                    placeholder="Optional cues or set details."
                    {...register(`exercises.${index}.notes`)}
                  />
                  {errors.exercises?.[index]?.notes ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.notes?.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formError ? (
        <p className="liftlog-pop-in rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      {success ? (
        <p className="liftlog-pop-in rounded-2xl border border-accent/25 bg-accent/10 p-3 text-sm font-medium text-soft-yellow">
          {success}
        </p>
      ) : null}

      <div className="hidden sm:block">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save workout"
              : "Create workout"}
        </button>
      </div>

      <div className="fixed inset-x-3 bottom-[5.75rem] z-30 rounded-[1.35rem] border border-line bg-card/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-stone-950 shadow-lg shadow-accent/20 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save workout"}
          </button>
          <button
            type="button"
            onClick={addExercise}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm font-black"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
