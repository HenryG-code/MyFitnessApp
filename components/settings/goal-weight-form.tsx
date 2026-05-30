"use client";

import { updateAuthenticatedGoalWeight } from "@/src/lib/profile/queries";
import type { Profile } from "@/src/lib/supabase/database.types";
import { Target, X } from "lucide-react";
import { useEffect, useState } from "react";

type GoalWeightFormProps = {
  initialGoalWeight: number | null;
  onSaved: (profile: Profile) => void;
};

function getInitialValue(value: number | null) {
  return value ? value.toString() : "";
}

function validateGoalWeight(value: string) {
  if (!value.trim()) {
    return { value: null, error: "" };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { value: null, error: "Goal weight must be greater than 0 kg." };
  }

  if (parsed > 400) {
    return { value: null, error: "Goal weight must be 400 kg or less." };
  }

  return { value: Number(parsed.toFixed(2)), error: "" };
}

export function GoalWeightForm({
  initialGoalWeight,
  onSaved,
}: GoalWeightFormProps) {
  const [goalWeight, setGoalWeight] = useState(getInitialValue(initialGoalWeight));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setGoalWeight(getInitialValue(initialGoalWeight));
  }, [initialGoalWeight]);

  async function saveGoalWeight(nextValue: string) {
    setError("");
    setNotice("");
    const validated = validateGoalWeight(nextValue);

    if (validated.error) {
      setError(validated.error);
      return;
    }

    setIsSaving(true);

    try {
      const profile = await updateAuthenticatedGoalWeight(validated.value);
      setGoalWeight(getInitialValue(profile.goal_weight_kg));
      setNotice(
        validated.value === null
          ? "Goal weight cleared."
          : "Goal weight saved."
      );
      onSaved(profile);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save goal weight."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-line bg-white/65 p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-white">
          <Target className="size-5" />
        </span>
        <div>
          <p className="font-display text-xl font-black">Goal weight, kg</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Set a goal weight to make your dashboard progress more useful.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="number"
          min="0"
          max="400"
          step="0.1"
          value={goalWeight}
          onChange={(event) => setGoalWeight(event.target.value)}
          className="min-h-12 rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm font-bold outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-400/10"
          placeholder="78.0"
        />
        <button
          type="button"
          onClick={() => void saveGoalWeight(goalWeight)}
          disabled={isSaving}
          className="min-h-12 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save goal"}
        </button>
        <button
          type="button"
          onClick={() => void saveGoalWeight("")}
          disabled={isSaving || !goalWeight}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm font-black text-muted transition hover:-translate-y-0.5 hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="size-4" />
          Clear
        </button>
      </div>

      {notice ? (
        <p className="mt-3 rounded-2xl border border-accent/25 bg-accent/15 p-3 text-sm font-bold text-teal-100">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-2xl border border-red-400/25 bg-red-950/40 p-3 text-sm font-bold text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
