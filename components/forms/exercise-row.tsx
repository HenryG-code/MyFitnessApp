"use client";

import { StepperField } from "@/components/forms/stepper-field";
import type { WorkoutFormValues } from "@/src/lib/workouts/form";
import { ChevronDown, Trash2 } from "lucide-react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

export function ExerciseRow({
  index,
  control,
  register,
  setValue,
  errors,
  canRemove,
  onRemove,
  expanded,
  onToggleDetails,
}: {
  index: number;
  control: Control<WorkoutFormValues>;
  register: UseFormRegister<WorkoutFormValues>;
  setValue: UseFormSetValue<WorkoutFormValues>;
  errors: FieldErrors<WorkoutFormValues>;
  canRemove: boolean;
  onRemove: () => void;
  expanded: boolean;
  onToggleDetails: () => void;
}) {
  return (
    <div className="liftlog-slide-in rounded-2xl border border-white/[0.07] bg-black/15 p-2.5 transition hover:border-white/[0.12] sm:p-4">
      <div className="flex items-start gap-2">
        <span className="lf-num grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-[0.68rem] font-black text-accent-strong">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <input
            aria-label={`Exercise ${index + 1} name`}
            className="min-h-10 w-full border-0 border-b border-line bg-transparent px-1 py-1 font-display text-base font-black outline-none transition placeholder:text-ink-dim/50 focus:border-accent sm:text-lg"
            placeholder="Exercise or movement"
            {...register(`exercises.${index}.exercise_name`)}
          />
          {errors.exercises?.[index]?.exercise_name ? (
            <p className="mt-1 text-xs font-medium text-strain">
              {errors.exercises[index]?.exercise_name?.message}
            </p>
          ) : null}
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove exercise ${index + 1}`}
            className="lf-press grid size-10 shrink-0 place-items-center rounded-xl text-ink-dim transition hover:bg-strain/10 hover:text-strain sm:inline-flex sm:w-auto sm:gap-2 sm:px-3"
          >
            <Trash2 className="size-4" />
            <span className="hidden text-xs font-black sm:inline">Remove</span>
          </button>
        ) : null}
      </div>

      <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
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
          onClick={onToggleDetails}
          aria-expanded={expanded}
          className="lf-press flex min-h-9 w-full items-center gap-1.5 border-t border-line pt-2 text-left text-xs font-bold text-ink-dim transition hover:text-foreground"
        >
          <span className="sm:hidden">More details</span>
          <span className="hidden sm:inline">Distance, duration & notes</span>
          <ChevronDown
            className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded ? (
          <div className="lf-fade grid grid-cols-2 gap-2 rounded-xl bg-white/[0.025] p-2.5 sm:p-3">
            <div>
              <label className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-muted">
                Distance, km
              </label>
              <input
                inputMode="decimal"
                className="lf-num mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface/80 px-3 text-base font-bold outline-none transition focus:border-accent sm:text-sm"
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
                className="lf-num mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface/80 px-3 text-base font-bold outline-none transition focus:border-accent sm:text-sm"
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
                className="mt-1.5 w-full resize-none rounded-xl border border-line bg-surface/80 px-3 py-2 text-base outline-none transition focus:border-accent sm:text-sm"
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
  );
}
