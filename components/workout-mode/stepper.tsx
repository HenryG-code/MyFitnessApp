"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

/** Tap-friendly numeric control with an inline edit mode for exact values. */
export function Stepper({
  label,
  value,
  display,
  onChange,
  step,
  inputMode,
}: {
  label: string;
  value: number;
  display: string;
  onChange: (next: number) => void;
  step: number;
  inputMode: "decimal" | "numeric";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const parsed = Number(draft.replace(",", "."));
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChange(parsed);
    }
    setEditing(false);
  }

  return (
    <div className="lf-inset flex flex-1 flex-col items-center px-2 py-3">
      <p className="lf-eyebrow !text-[0.6rem]">{label}</p>
      <div className="mt-1.5 flex w-full items-center justify-between gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - step))}
          className="lf-press grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Minus className="size-4" />
        </button>
        {editing ? (
          <input
            autoFocus
            inputMode={inputMode}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                commit();
              }
            }}
            aria-label={label}
            className="lf-num w-16 rounded-lg border border-accent/50 bg-transparent py-1 text-center font-display text-2xl font-black outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(String(value));
              setEditing(true);
            }}
            aria-label={`Edit ${label}`}
            className="lf-num min-w-0 truncate px-1 font-display text-[1.7rem] font-black leading-none"
          >
            {display}
          </button>
        )}
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + step)}
          className="lf-press grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
