"use client";

import type { DailyHabit } from "@/src/lib/supabase/database.types";
import { updateHabitCompletedValue } from "@/src/lib/habits/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type HabitProgressFormProps = {
  habit: DailyHabit;
  onSaved: (message: string) => void;
};

function getLimit(habitKey: string) {
  return habitKey === "sleep_8_hours" ? 24 : 100000;
}

function getStep(unit: string | null) {
  return unit === "hours" ? "0.25" : "1";
}

export function HabitProgressForm({ habit, onSaved }: HabitProgressFormProps) {
  const [formError, setFormError] = useState("");
  const limit = getLimit(habit.habit_key);
  const schema = z.object({
    completed_value: z
      .number({ error: "Enter a progress value." })
      .min(0, "Value cannot be negative.")
      .max(limit, `Value cannot exceed ${limit.toLocaleString()}.`),
  });
  type ProgressValues = z.infer<typeof schema>;

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ProgressValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      completed_value: habit.completed_value ?? 0,
    },
  });

  async function onSubmit(values: ProgressValues) {
    setFormError("");

    try {
      await updateHabitCompletedValue(habit, values.completed_value);
      onSaved(`${habit.label} progress updated.`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not update habit progress."
      );
    }
  }

  return (
    <form className="mt-4 space-y-2" onSubmit={handleSubmit(onSubmit)}>
      <label className="text-xs font-black uppercase tracking-[0.18em] text-muted">
        Progress
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          max={limit}
          step={getStep(habit.unit)}
          className="min-w-0 flex-1 rounded-2xl border border-line bg-white/80 px-4 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
          {...register("completed_value", { valueAsNumber: true })}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
      {errors.completed_value ? (
        <p className="text-sm font-medium text-red-700">
          {errors.completed_value.message}
        </p>
      ) : null}
      {formError ? (
        <p className="text-sm font-medium text-red-700">{formError}</p>
      ) : null}
    </form>
  );
}
