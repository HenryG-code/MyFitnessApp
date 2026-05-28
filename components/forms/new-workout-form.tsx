"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const workoutSchema = z.object({
  title: z.string().min(2, "Name the workout."),
  type: z.enum(["Strength", "Cardio", "Mobility", "Sport"]),
  duration: z.number().min(1, "Duration must be at least 1 minute."),
  notes: z.string().max(240, "Keep notes under 240 characters.").optional(),
});

type WorkoutValues = z.infer<typeof workoutSchema>;

export function NewWorkoutForm() {
  const [message, setMessage] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<WorkoutValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      title: "",
      type: "Strength",
      duration: 45,
      notes: "",
    },
  });

  function onSubmit(values: WorkoutValues) {
    setMessage(
      `${values.title} is ready to save once Supabase is connected. For now this is mock-only.`
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="text-sm font-black" htmlFor="title">
          Workout name
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-black" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
            {...register("type")}
          >
            <option>Strength</option>
            <option>Cardio</option>
            <option>Mobility</option>
            <option>Sport</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-black" htmlFor="duration">
            Duration, minutes
          </label>
          <input
            id="duration"
            type="number"
            className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
            {...register("duration", { valueAsNumber: true })}
          />
          {errors.duration ? (
            <p className="mt-2 text-sm font-medium text-red-700">
              {errors.duration.message}
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
          rows={5}
          className="mt-2 w-full rounded-2xl border border-line bg-white/80 px-4 py-3 outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-700/10"
          placeholder="Exercises, sets, effort, or anything you want to remember."
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-sm font-medium text-red-700">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-900/15 transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70"
      >
        Add mock workout
      </button>

      {message ? (
        <p className="rounded-2xl bg-[#eaf3dd] p-3 text-sm font-medium text-accent-strong">
          {message}
        </p>
      ) : null}
    </form>
  );
}
