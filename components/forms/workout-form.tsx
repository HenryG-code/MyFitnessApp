"use client";

import {
  createWorkout,
  updateWorkout,
  type WorkoutInput,
  type WorkoutWithExercises,
} from "@/src/lib/workouts/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
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

type StepperName =
  | `exercises.${number}.sets`
  | `exercises.${number}.reps`
  | `exercises.${number}.weight`;

/** Compact registered numeric input with tap-friendly adjustment controls. */
function StepperField({
  label,
  name,
  step,
  control,
  register,
  setValue,
  error,
}: {
  label: string;
  name: StepperName;
  step: number;
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  setValue: UseFormSetValue<WorkoutFormValues>;
  error?: string;
}) {
  const raw = useWatch({ control, name }) ?? "";

  function adjust(direction: 1 | -1) {
    const current = Number(String(raw).trim()) || 0;
    const next = Math.max(0, Math.round((current + direction * step) * 10) / 10);
    setValue(name, next ? String(next) : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="min-w-0 rounded-xl border border-line bg-black/10 p-1.5">
      <p className="text-center text-[0.6rem] font-black uppercase tracking-[0.12em] text-muted sm:text-[0.65rem]">
        {label}
      </p>
      <div className="mt-1 grid grid-cols-[1.75rem_minmax(0,1fr)_1.75rem] items-center gap-0.5 sm:grid-cols-[2rem_minmax(0,1fr)_2rem]">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => adjust(-1)}
          className="lf-press grid size-7 place-items-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-foreground sm:size-8"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          inputMode="decimal"
          aria-label={label}
          placeholder="—"
          className="lf-num min-h-9 w-full min-w-0 rounded-lg border border-line bg-surface/80 px-0.5 text-center text-base font-black outline-none transition focus:border-accent sm:text-sm"
          {...register(name)}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => adjust(1)}
          className="lf-press grid size-7 place-items-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-foreground sm:size-8"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs font-medium text-strain">{error}</p>
      ) : null}
    </div>
  );
}

export function WorkoutForm({ mode = "create", workout }: WorkoutFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: getDefaultValues(workout),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: "exercises",
  });
  const [showWorkoutNotes, setShowWorkoutNotes] = useState(Boolean(workout?.notes));
  // Rows with pre-existing distance/duration/notes start expanded.
  const [expandedRows, setExpandedRows] = useState<Set<number>>(() => {
    const expanded = new Set<number>();
    workout?.exercises.forEach((exercise, index) => {
      if (exercise.distance_km || exercise.duration_minutes || exercise.notes) {
        expanded.add(index);
      }
    });
    return expanded;
  });

  function toggleRowDetails(index: number) {
    setExpandedRows((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function addExercise() {
    append(getEmptyExercise(), {
      focusName: `exercises.${fields.length}.exercise_name`,
    });
  }

  function applyTitleSuggestion(title: string) {
    const currentTitle = getValues("title").trim();

    if (!currentTitle || window.confirm(`Replace "${currentTitle}" with "${title}"?`)) {
      setValue("title", title, { shouldDirty: true, shouldValidate: true });
    }
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
      className="space-y-3 pb-24 sm:space-y-5 sm:pb-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <label className="text-xs font-black sm:text-sm" htmlFor="title">
          Workout name
        </label>
        <input
          id="title"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface/80 px-3 py-2.5 text-base font-semibold outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:mt-2 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
          placeholder="Upper body strength"
          {...register("title")}
        />
        {errors.title ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.title.message}
          </p>
        ) : null}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 sm:mt-3 sm:gap-2">
          {workoutTitleSuggestions.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => applyTitleSuggestion(title)}
              className="shrink-0 rounded-full border border-line bg-white/65 px-2.5 py-1.5 text-[0.7rem] font-black text-muted transition hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 sm:px-3 sm:py-2 sm:text-xs"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-2 sm:grid-cols-2 sm:gap-3">
        <div>
          <label className="text-xs font-black sm:text-sm" htmlFor="workout_date">
            Date
          </label>
          <input
            id="workout_date"
            type="date"
            className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface/80 px-2.5 py-2 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:mt-2 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
            {...register("workout_date")}
          />
          {errors.workout_date ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.workout_date.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-xs font-black sm:text-sm" htmlFor="duration_minutes">
            Minutes
          </label>
          <input
            id="duration_minutes"
            type="number"
            min="1"
            step="1"
            className="mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-line bg-surface/80 px-2.5 py-2 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:mt-2 sm:min-h-12 sm:rounded-2xl sm:px-4 sm:py-3"
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

      <div className="rounded-xl border border-line bg-black/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setShowWorkoutNotes((current) => !current)}
          aria-expanded={showWorkoutNotes}
          className="lf-press flex w-full items-center gap-3 text-left text-xs font-black sm:text-sm"
        >
          Workout notes
          <span className="font-medium text-muted">Optional</span>
          <ChevronDown
            className={`ml-auto size-4 text-muted transition-transform ${showWorkoutNotes ? "rotate-180" : ""}`}
          />
        </button>
        {showWorkoutNotes ? (
          <div className="lf-fade pt-2.5">
            <textarea
              id="notes"
              rows={2}
              className="w-full rounded-xl border border-line bg-surface/80 px-3 py-2.5 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:text-sm"
              placeholder="How did the session feel?"
              {...register("notes")}
            />
            {errors.notes ? (
              <p className="mt-1.5 text-xs font-medium text-red-700">
                {errors.notes.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-line bg-white/45 p-2.5 sm:rounded-[1.5rem] sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-accent sm:text-xs sm:tracking-[0.24em]">
              Exercises
            </p>
            <p className="mt-0.5 text-xs text-muted sm:mt-1 sm:text-sm sm:leading-6">
              {fields.length} {fields.length === 1 ? "exercise" : "exercises"} added
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

        <div className="mt-2.5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card/70 sm:mt-4 sm:rounded-[1.35rem]">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="liftlog-slide-in relative p-3 transition hover:bg-white/[0.035] sm:p-5"
            >
              <div className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-accent/80 sm:inset-y-4" />
              <div className="flex items-start gap-2 pl-1">
                <span className="lf-num grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-xs font-black text-accent-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    aria-label={`Exercise ${index + 1} name`}
                    className="min-h-9 w-full rounded-xl border border-line bg-surface/80 px-3 py-2 text-base font-semibold outline-none transition focus:border-accent sm:text-sm"
                    placeholder="Exercise name"
                    {...register(`exercises.${index}.exercise_name`)}
                  />
                  {errors.exercises?.[index]?.exercise_name ? (
                    <p className="mt-1 text-xs font-medium text-strain">
                      {errors.exercises[index]?.exercise_name?.message}
                    </p>
                  ) : null}
                </div>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove exercise ${index + 1}`}
                    className="lf-press grid size-9 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700 sm:inline-flex sm:w-auto sm:gap-2 sm:px-3"
                  >
                    <Trash2 className="size-4" />
                    <span className="hidden text-xs font-black sm:inline">Remove</span>
                  </button>
                ) : null}
              </div>

              <div className="mt-2.5 space-y-2.5 pl-1 sm:mt-3 sm:space-y-3">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <StepperField
                    label="Sets"
                    name={`exercises.${index}.sets`}
                    step={1}
                    control={control}
                    register={register}
                    setValue={setValue}
                    error={errors.exercises?.[index]?.sets?.message}
                  />
                  <StepperField
                    label="Reps"
                    name={`exercises.${index}.reps`}
                    step={1}
                    control={control}
                    register={register}
                    setValue={setValue}
                    error={errors.exercises?.[index]?.reps?.message}
                  />
                  <StepperField
                    label="Kg"
                    name={`exercises.${index}.weight`}
                    step={2.5}
                    control={control}
                    register={register}
                    setValue={setValue}
                    error={errors.exercises?.[index]?.weight?.message}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleRowDetails(index)}
                  aria-expanded={expandedRows.has(index)}
                  className="lf-press flex items-center gap-1 py-1 text-xs font-bold text-ink-dim transition hover:text-foreground"
                >
                  <span className="sm:hidden">More details</span>
                  <span className="hidden sm:inline">Distance, duration & notes</span>
                  <ChevronDown
                    className={`size-3.5 transition-transform ${expandedRows.has(index) ? "rotate-180" : ""}`}
                  />
                </button>

                {expandedRows.has(index) ? (
                  <div className="lf-fade grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">
                        Distance, km
                      </label>
                      <input
                        inputMode="decimal"
                        className="lf-num mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface/80 px-3 text-base outline-none transition focus:border-accent sm:text-sm"
                        {...register(`exercises.${index}.distance_km`)}
                      />
                      {errors.exercises?.[index]?.distance_km ? (
                        <p className="mt-1 text-xs font-medium text-strain">
                          {errors.exercises[index]?.distance_km?.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">
                        Duration, min
                      </label>
                      <input
                        inputMode="numeric"
                        className="lf-num mt-1.5 min-h-10 w-full rounded-lg border border-line bg-surface/80 px-3 text-base outline-none transition focus:border-accent sm:text-sm"
                        {...register(`exercises.${index}.duration_minutes`)}
                      />
                      {errors.exercises?.[index]?.duration_minutes ? (
                        <p className="mt-1 text-xs font-medium text-strain">
                          {errors.exercises[index]?.duration_minutes?.message}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-span-2">
                      <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">
                        Notes
                      </label>
                      <textarea
                        rows={2}
                        className="mt-1.5 w-full rounded-lg border border-line bg-surface/80 px-3 py-2 text-base outline-none transition focus:border-accent sm:text-sm"
                        placeholder="Optional cues or set details."
                        {...register(`exercises.${index}.notes`)}
                      />
                      {errors.exercises?.[index]?.notes ? (
                        <p className="mt-1 text-xs font-medium text-strain">
                          {errors.exercises[index]?.notes?.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
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

      <div className="fixed inset-x-3 bottom-[5.75rem] z-30 rounded-2xl border border-line bg-card/95 p-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-11 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-stone-950 shadow-lg shadow-accent/20 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save workout"}
          </button>
          <button
            type="button"
            onClick={addExercise}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white/65 px-3 py-2.5 text-sm font-black"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
