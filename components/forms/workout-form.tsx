"use client";

import { ExerciseRow } from "@/components/forms/exercise-row";
import {
  getDefaultValues,
  getEmptyExercise,
  toWorkoutInput,
  workoutSchema,
  workoutTitleSuggestions,
  type WorkoutFormValues,
} from "@/src/lib/workouts/form";
import {
  createWorkout,
  updateWorkout,
  type WorkoutWithExercises,
} from "@/src/lib/workouts/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  ListPlus,
  NotebookPen,
  Plus,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

type WorkoutFormProps = {
  mode?: "create" | "edit";
  workout?: WorkoutWithExercises;
};

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
      className="space-y-3 pb-24 sm:space-y-4 sm:pb-0"
      onSubmit={handleSubmit(onSubmit)}
    >
      <section className="rounded-[1.5rem] border border-white/[0.07] bg-gradient-to-br from-card via-card/95 to-surface/90 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.3)] sm:rounded-[1.75rem] sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="lf-num grid size-9 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-xs font-black text-accent-strong">
              01
            </span>
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-ink-dim">
                Session
              </p>
              <h2 className="font-display text-lg font-black tracking-tight">
                The essentials
              </h2>
            </div>
          </div>
          <NotebookPen className="size-5 text-ink-dim" />
        </div>

        <label className="sr-only" htmlFor="title">
          Workout name
        </label>
        <input
          id="title"
          className="min-h-14 w-full border-0 border-b border-line bg-transparent px-0 py-2 font-display text-xl font-black tracking-tight outline-none transition placeholder:text-ink-dim/55 focus:border-accent sm:min-h-16 sm:text-3xl"
          placeholder="Name this workout"
          {...register("title")}
        />
        {errors.title ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.title.message}
          </p>
        ) : null}
        <div className="lf-scroll-x -mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mt-3 sm:flex-wrap sm:gap-2">
          {workoutTitleSuggestions.map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => applyTitleSuggestion(title)}
              className="lf-press shrink-0 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[0.68rem] font-black text-muted transition hover:border-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 sm:text-xs"
            >
              {title}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-3">
          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-2.5 sm:rounded-2xl sm:p-3">
            <label
              className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-muted"
              htmlFor="workout_date"
            >
              <CalendarDays className="size-3.5 text-accent-strong" />
              Date
            </label>
            <input
              id="workout_date"
              type="date"
              className="mt-1 min-h-10 w-full min-w-0 bg-transparent text-sm font-black outline-none sm:text-base"
              {...register("workout_date")}
            />
            {errors.workout_date ? (
              <p className="mt-2 text-sm font-medium text-red-700">
                {errors.workout_date.message}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-black/15 p-2.5 sm:rounded-2xl sm:p-3">
            <label
              className="flex items-center gap-2 text-[0.62rem] font-black uppercase tracking-[0.16em] text-muted"
              htmlFor="duration_minutes"
            >
              <Clock3 className="size-3.5 text-sun" />
              Minutes
            </label>
            <input
              id="duration_minutes"
              type="number"
              min="1"
              step="1"
              className="lf-num mt-1 min-h-10 w-full min-w-0 bg-transparent text-xl font-black outline-none placeholder:text-ink-dim/50 sm:text-2xl"
              placeholder="00"
              {...register("duration_minutes")}
            />
            {errors.duration_minutes ? (
              <p className="mt-2 text-sm font-medium text-red-700">
                {errors.duration_minutes.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2.5 sm:rounded-2xl sm:px-4 sm:py-3">
          <button
            type="button"
            onClick={() => setShowWorkoutNotes((current) => !current)}
            aria-expanded={showWorkoutNotes}
            className="lf-press flex min-h-8 w-full items-center gap-2.5 text-left text-xs font-black sm:text-sm"
          >
            <NotebookPen className="size-4 text-ink-dim" />
            Workout notes
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-muted">
              Optional
            </span>
            <ChevronDown
              className={`ml-auto size-4 text-muted transition-transform ${showWorkoutNotes ? "rotate-180" : ""}`}
            />
          </button>
          {showWorkoutNotes ? (
            <div className="lf-fade pt-2.5">
              <textarea
                id="notes"
                rows={2}
                className="w-full resize-none rounded-xl border border-line bg-surface/80 px-3 py-2.5 text-base outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 sm:text-sm"
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
      </section>

      <section className="rounded-[1.5rem] border border-white/[0.07] bg-gradient-to-br from-card via-card/95 to-surface/90 p-3 shadow-[0_22px_70px_rgba(0,0,0,0.3)] sm:rounded-[1.75rem] sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="lf-num grid size-9 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-xs font-black text-accent-strong">
              02
            </span>
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-ink-dim">
                Movements
              </p>
              <h2 className="font-display text-lg font-black tracking-tight">
                {fields.length} {fields.length === 1 ? "exercise" : "exercises"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={addExercise}
            className="lf-press hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 text-sm font-black text-accent-strong transition hover:bg-accent hover:text-white sm:inline-flex"
          >
            <Plus className="size-4" />
            Add exercise
          </button>
        </div>

        <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
          {fields.map((field, index) => (
            <ExerciseRow
              key={field.id}
              index={index}
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
              canRemove={fields.length > 1}
              onRemove={() => remove(index)}
              expanded={expandedRows.has(index)}
              onToggleDetails={() => toggleRowDetails(index)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addExercise}
          className="lf-press mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] text-sm font-black text-muted transition hover:border-accent/50 hover:bg-accent/5 hover:text-foreground sm:hidden"
        >
          <ListPlus className="size-4" />
          Add another exercise
        </button>
      </section>

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

      <div className="hidden items-center justify-between gap-4 rounded-[1.5rem] border border-white/[0.07] bg-card/85 p-4 sm:flex">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-ink-dim">
            Ready to finish?
          </p>
          <p className="mt-1 text-sm font-bold text-muted">
            {fields.length} {fields.length === 1 ? "exercise" : "exercises"} in this session
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="lf-press inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-black text-white shadow-[0_10px_32px_rgba(240,71,46,0.28)] transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save className="size-4" />
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Creating..."
            : mode === "edit"
              ? "Save workout"
              : "Create workout"}
        </button>
      </div>

      <div className="fixed inset-x-3 bottom-[5.75rem] z-30 rounded-2xl border border-white/[0.1] bg-[#151518]/95 p-1.5 shadow-[0_20px_70px_rgba(0,0,0,0.58)] backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-[auto_1fr] items-center gap-2">
          <div className="px-2 text-center">
            <p className="lf-num text-lg font-black">{fields.length}</p>
            <p className="text-[0.55rem] font-black uppercase tracking-wider text-ink-dim">
              Moves
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="lf-press inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-accent/20 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="size-4" />
            {isSubmitting ? "Saving..." : "Save workout"}
          </button>
        </div>
      </div>
    </form>
  );
}
