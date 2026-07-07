"use client";

import { getDateInputValue } from "@/src/lib/habits/queries";
import { createWeightLog, updateWeightLog } from "@/src/lib/weight/queries";
import type { WeightLog } from "@/src/lib/supabase/database.types";
import { Check, Minus, Plus } from "lucide-react";
import { useState } from "react";

type QuickWeightLogProps = {
  /** Most recent log — seeds the stepper and detects "already logged today". */
  latestLog: WeightLog | null;
  onSaved: (message: string) => void;
};

/**
 * One-tap daily weigh-in: stepper seeded with the last weight, logs for
 * today. Updates today's entry instead of duplicating it.
 */
export function QuickWeightLog({ latestLog, onSaved }: QuickWeightLogProps) {
  const [weight, setWeight] = useState(latestLog?.weight_kg ?? 80);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [seededFrom, setSeededFrom] = useState(latestLog?.id ?? null);

  // Derived state: re-seed the stepper when the latest log first arrives.
  if (latestLog && latestLog.id !== seededFrom) {
    setSeededFrom(latestLog.id);
    setWeight(latestLog.weight_kg);
  }

  const today = getDateInputValue();
  const todayLog = latestLog?.logged_at === today ? latestLog : null;

  function commitDraft() {
    const parsed = Number(draft.replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0 && parsed < 500) {
      setWeight(Math.round(parsed * 10) / 10);
    }
    setEditing(false);
  }

  async function save() {
    setIsSaving(true);
    setError("");

    try {
      if (todayLog) {
        await updateWeightLog(todayLog.id, {
          logged_at: today,
          weight_kg: weight,
          notes: todayLog.notes,
        });
      } else {
        await createWeightLog({
          logged_at: today,
          weight_kg: weight,
          notes: null,
        });
      }

      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1800);
      onSaved(todayLog ? "Today's weigh-in updated." : "Weigh-in logged.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save. Try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="lf-panel p-4">
      <div className="flex items-center justify-between">
        <p className="lf-eyebrow text-accent-strong">
          {todayLog ? "Update today's weigh-in" : "Quick weigh-in · today"}
        </p>
        {latestLog && !todayLog ? (
          <p className="lf-num text-[0.65rem] font-bold text-ink-dim">
            Last: {latestLog.weight_kg.toFixed(1)} kg
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Decrease weight by 0.1 kg"
          onClick={() => setWeight((value) => Math.max(1, Math.round((value - 0.1) * 10) / 10))}
          className="lf-press grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>

        {editing ? (
          <input
            autoFocus
            inputMode="decimal"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={(event) => event.key === "Enter" && commitDraft()}
            aria-label="Weight in kilograms"
            className="lf-num w-full min-w-0 flex-1 rounded-xl border border-accent/50 bg-transparent py-2 text-center font-display text-3xl font-black outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(weight.toFixed(1));
              setEditing(true);
            }}
            aria-label="Edit weight value"
            className="lf-num min-w-0 flex-1 py-2 text-center font-display text-3xl font-black leading-none"
          >
            {weight.toFixed(1)}
            <span className="ml-1 text-sm font-bold text-muted">kg</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Increase weight by 0.1 kg"
          onClick={() => setWeight((value) => Math.round((value + 0.1) * 10) / 10)}
          className="lf-press grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className={`lf-press mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-black tracking-wide transition disabled:opacity-60 ${
          justSaved
            ? "bg-ready/15 text-ready"
            : "bg-accent text-white shadow-[0_8px_24px_rgba(240,71,46,0.3)] hover:bg-accent-strong"
        }`}
      >
        {justSaved ? (
          <>
            <Check className="size-4" />
            LOGGED
          </>
        ) : isSaving ? (
          "SAVING…"
        ) : todayLog ? (
          "UPDATE TODAY"
        ) : (
          "LOG TODAY"
        )}
      </button>

      {error ? (
        <p className="mt-2 text-xs font-bold text-strain">{error}</p>
      ) : null}
    </div>
  );
}
