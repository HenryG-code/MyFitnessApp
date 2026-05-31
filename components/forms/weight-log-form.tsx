"use client";

import {
  createWeightLog,
  updateWeightLog,
  type WeightLogFormInput,
} from "@/src/lib/weight/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const weightLogSchema = z.object({
  weight_kg: z
    .number({ error: "Weight is required." })
    .positive("Weight must be greater than 0."),
  logged_at: z.string().min(1, "Date is required."),
  notes: z.string().max(240, "Keep notes under 240 characters.").optional(),
});

type WeightLogValues = z.infer<typeof weightLogSchema>;

type WeightLogFormProps = {
  mode?: "create" | "edit";
  logId?: string;
  initialValues?: WeightLogValues;
  onCancel?: () => void;
  onSaved: (message: string) => void;
};

function getTodayDateInputValue() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function normalizeNotes(notes: string | undefined) {
  const trimmed = notes?.trim();
  return trimmed ? trimmed : null;
}

export function WeightLogForm({
  mode = "create",
  logId,
  initialValues,
  onCancel,
  onSaved,
}: WeightLogFormProps) {
  const [formError, setFormError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<WeightLogValues>({
    resolver: zodResolver(weightLogSchema),
    defaultValues: initialValues ?? {
      weight_kg: 0,
      logged_at: getTodayDateInputValue(),
      notes: "",
    },
  });

  async function onSubmit(values: WeightLogValues) {
    setFormError("");

    try {
      const payload: WeightLogFormInput = {
        logged_at: values.logged_at,
        weight_kg: values.weight_kg,
        notes: normalizeNotes(values.notes),
      };

      if (mode === "edit") {
        if (!logId) {
          throw new Error("Missing weight log id.");
        }

        await updateWeightLog(logId, payload);
        onSaved("Weight log updated.");
        return;
      }

      await createWeightLog(payload);
      reset({
        weight_kg: 0,
        logged_at: getTodayDateInputValue(),
        notes: "",
      });
      onSaved("Weight log added.");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save this weight log. Please try again."
      );
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-black" htmlFor={`${mode}-weight`}>
            Weight, kg
          </label>
          <input
            id={`${mode}-weight`}
            type="number"
            step="0.1"
            min="0"
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            placeholder="78.4"
            {...register("weight_kg", { valueAsNumber: true })}
          />
          {errors.weight_kg ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.weight_kg.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="text-sm font-black" htmlFor={`${mode}-logged-at`}>
            Date
          </label>
          <input
            id={`${mode}-logged-at`}
            type="date"
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
            {...register("logged_at")}
          />
          {errors.logged_at ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.logged_at.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="text-sm font-black" htmlFor={`${mode}-notes`}>
          Notes
        </label>
        <textarea
          id={`${mode}-notes`}
          rows={mode === "edit" ? 3 : 4}
          className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
          placeholder="Optional context, like morning weigh-in or post-travel."
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p className="rounded-2xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Saving..."
              : "Adding..."
            : mode === "edit"
              ? "Save changes"
              : "Add weight log"}
        </button>

        {mode === "edit" && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl border border-line bg-white/70 px-5 py-3 text-sm font-black text-muted transition hover:-translate-y-0.5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
