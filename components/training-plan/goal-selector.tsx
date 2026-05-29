"use client";

import { trainingGoals } from "@/src/lib/training-plans/data";
import type { TrainingGoal } from "@/src/lib/training-plans/types";
import { Target } from "lucide-react";

type GoalSelectorProps = {
  selectedGoal: TrainingGoal;
  onChange: (goal: TrainingGoal) => void;
};

export function GoalSelector({ selectedGoal, onChange }: GoalSelectorProps) {
  return (
    <section className="rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
          <Target className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Goal selector
          </p>
          <h2 className="font-display text-2xl font-black">
            Choose your training focus
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {trainingGoals.map((goal) => {
          const active = goal === selectedGoal;

          return (
            <button
              key={goal}
              type="button"
              onClick={() => onChange(goal)}
              className={`rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${
                active
                  ? "border-accent bg-accent text-white shadow-lg shadow-teal-900/15"
                  : "border-line bg-white/70 text-foreground hover:border-accent"
              }`}
            >
              <span className="font-display text-lg font-black">{goal}</span>
              <span
                className={`mt-1 block text-sm leading-6 ${
                  active ? "text-white/80" : "text-muted"
                }`}
              >
                Beginner/intermediate, 4 days, gym/mixed.
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
