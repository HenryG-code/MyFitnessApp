"use client";

import type { WorkoutFormValues } from "@/src/lib/workouts/form";
import { Minus, Plus } from "lucide-react";
import {
  useWatch,
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

export type StepperName =
  | `exercises.${number}.sets`
  | `exercises.${number}.reps`
  | `exercises.${number}.weight`;

/** Compact registered numeric input with tap-friendly adjustment controls. */
export function StepperField({
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
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] p-1.5 sm:p-2">
      <p className="text-center text-[0.58rem] font-black uppercase tracking-[0.14em] text-ink-dim sm:text-[0.62rem]">
        {label}
      </p>
      <div className="mt-1.5 grid grid-cols-[1.8rem_minmax(0,1fr)_1.8rem] items-center gap-0.5 sm:grid-cols-[2rem_minmax(0,1fr)_2rem]">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => adjust(-1)}
          className="lf-press grid size-7 place-items-center rounded-lg bg-black/15 text-muted transition hover:bg-white/[0.06] hover:text-foreground sm:size-8"
        >
          <Minus className="size-3.5" />
        </button>
        <input
          inputMode="decimal"
          aria-label={label}
          placeholder="—"
          className="lf-num min-h-10 w-full min-w-0 border-0 bg-transparent px-0.5 text-center text-lg font-black outline-none transition placeholder:text-ink-dim/40 focus:text-accent-strong sm:text-base"
          {...register(name)}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => adjust(1)}
          className="lf-press grid size-7 place-items-center rounded-lg bg-black/15 text-muted transition hover:bg-white/[0.06] hover:text-foreground sm:size-8"
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
