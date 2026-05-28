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

const workoutTypes = ["Strength", "Cardio", "Mobility", "Sport", "Mixed"];

const exerciseSchema = z.object({
  name: z.string(),
  sets: z.string(),
  reps: z.string(),
  weight_kg: z.string(),
  notes: z.string().max(240, "Keep exercise notes under 240 characters."),
});

const workoutSchema = z
  .object({
    title: z.string().trim().min(2, "Title must be at least 2 characters."),
    workout_type: z.string(),
    started_at: z.string().min(1, "Start date and time is required."),
    duration_minutes: z.string(),
    notes: z.string().max(500, "Keep workout notes under 500 characters."),
    exercises: z.array(exerciseSchema),
  })
  .superRefine((values, context) => {
    validateOptionalNumber(
      values.duration_minutes,
      "duration_minutes",
      context,
      "Duration must be positive."
    );

    values.exercises.forEach((exercise, index) => {
      const hasAnyValue = [
        exercise.name,
        exercise.sets,
        exercise.reps,
        exercise.weight_kg,
        exercise.notes,
      ].some((value) => value.trim());

      if (!hasAnyValue) {
        return;
      }

      if (!exercise.name.trim()) {
        context.addIssue({
          code: "custom",
          message: "Exercise name is required.",
          path: ["exercises", index, "name"],
        });
      }

      validateOptionalNumber(
        exercise.sets,
        ["exercises", index, "sets"],
        context,
        "Sets cannot be negative.",
        true
      );
      validateOptionalNumber(
        exercise.reps,
        ["exercises", index, "reps"],
        context,
        "Reps cannot be negative.",
        true
      );
      validateOptionalNumber(
        exercise.weight_kg,
        ["exercises", index, "weight_kg"],
        context,
        "Weight cannot be negative."
      );
    });
  });

type WorkoutFormValues = z.infer<typeof workoutSchema>;

type WorkoutFormProps = {
  mode?: "create" | "edit";
  workout?: WorkoutWithExercises;
};

type IssuePath = string | (string | number)[];

function validateOptionalNumber(
  value: string,
  path: IssuePath,
  context: z.RefinementCtx,
  message: string,
  integerOnly = false
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0 || (integerOnly && !Number.isInteger(parsed))) {
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

function getDateTimeInputValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function toDateTimeInputValue(value: string) {
  return getDateTimeInputValue(new Date(value));
}

function getEmptyExercise() {
  return {
    name: "",
    sets: "",
    reps: "",
    weight_kg: "",
    notes: "",
  };
}

function getDefaultValues(workout?: WorkoutWithExercises): WorkoutFormValues {
  if (!workout) {
    return {
      title: "",
      workout_type: "Strength",
      started_at: getDateTimeInputValue(),
      duration_minutes: "",
      notes: "",
      exercises: [getEmptyExercise()],
    };
  }

  return {
    title: workout.title,
    workout_type: workout.workout_type ?? "Strength",
    started_at: toDateTimeInputValue(workout.started_at),
    duration_minutes: workout.duration_minutes?.toString() ?? "",
    notes: workout.notes ?? "",
    exercises: workout.exercises.length
      ? workout.exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets?.toString() ?? "",
          reps: exercise.reps?.toString() ?? "",
          weight_kg: exercise.weight_kg?.toString() ?? "",
          notes: exercise.notes ?? "",
        }))
      : [getEmptyExercise()],
  };
}

function toWorkoutInput(values: WorkoutFormValues): WorkoutInput {
  return {
    title: values.title.trim(),
    workout_type: normalizeOptionalText(values.workout_type),
    started_at: new Date(values.started_at).toISOString(),
    duration_minutes: parseOptionalNumber(values.duration_minutes),
    notes: normalizeOptionalText(values.notes),
    exercises: values.exercises
      .filter((exercise) => exercise.name.trim())
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: parseOptionalNumber(exercise.sets),
        reps: parseOptionalNumber(exercise.reps),
        weight_kg: parseOptionalNumber(exercise.weight_kg),
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
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: getDefaultValues(workout),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "exercises",
  });

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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-black" htmlFor="title">
          Workout title
        </label>
        <input
          id="title"
          className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
          placeholder="Upper Body Strength"
          {...register("title")}
        />
        {errors.title ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-black" htmlFor="workout_type">
            Type
          </label>
          <select
            id="workout_type"
            className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
            {...register("workout_type")}
          >
            <option value="">No type</option>
            {workoutTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-black" htmlFor="started_at">
            Started at
          </label>
          <input
            id="started_at"
            type="datetime-local"
            className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
            {...register("started_at")}
          />
          {errors.started_at ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.started_at.message}
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
            min="0"
            step="1"
            className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
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
          rows={4}
          className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
          placeholder="How did the session feel?"
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] border border-line bg-white/45 p-4">
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
            onClick={() => append(getEmptyExercise())}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
          >
            <Plus className="size-4" />
            Add exercise
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-[1.25rem] bg-card/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg font-black">
                  Exercise {index + 1}
                </p>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-black text-red-700"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="sm:col-span-4">
                  <label className="text-sm font-black">Name</label>
                  <input
                    className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
                    placeholder="Bench press"
                    {...register(`exercises.${index}.name`)}
                  />
                  {errors.exercises?.[index]?.name ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.name?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-black">Sets</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
                    {...register(`exercises.${index}.sets`)}
                  />
                  {errors.exercises?.[index]?.sets ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.sets?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-black">Reps</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
                    {...register(`exercises.${index}.reps`)}
                  />
                  {errors.exercises?.[index]?.reps ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.reps?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-black">Weight, kg</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
                    {...register(`exercises.${index}.weight_kg`)}
                  />
                  {errors.exercises?.[index]?.weight_kg ? (
                    <p className="mt-2 text-sm font-medium text-red-700">
                      {errors.exercises[index]?.weight_kg?.message}
                    </p>
                  ) : null}
                </div>

                <div className="sm:col-span-4">
                  <label className="text-sm font-black">Exercise notes</label>
                  <textarea
                    rows={2}
                    className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
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
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-2xl bg-[#eaf3dd] p-3 text-sm font-medium text-accent-strong">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? mode === "edit"
            ? "Saving..."
            : "Creating..."
          : mode === "edit"
            ? "Save workout"
            : "Create workout"}
      </button>
    </form>
  );
}
