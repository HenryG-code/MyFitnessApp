"use client";

import { trainingGoals } from "@/src/lib/training-plans/data";
import type { TrainingGoal } from "@/src/lib/training-plans/types";
import { Target } from "lucide-react";
import { FitnessCard } from "@/components/ui/fitness-card";

type GoalSelectorProps = {
  selectedGoal: TrainingGoal;
  onChange: (goal: TrainingGoal) => void;
};

export function GoalSelector({ selectedGoal, onChange }: GoalSelectorProps) {
  return (
    <FitnessCard>
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-accent text-stone-950">
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
              className={`rounded-2xl border px-4 py-4 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)] focus-visible:ring-4 focus-visible:ring-accent/35 ${
                active
                  ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                  : "border-line/80 bg-white/75 text-foreground hover:border-accent"
              }`}
            >
              <span className="font-display text-lg font-black">{goal}</span>
              <span
                className={`mt-1 block text-sm leading-6 ${
                  active ? "text-red-50/90" : "text-muted"
                }`}
              >
                Beginner/intermediate, 4 days, gym/mixed.
              </span>
            </button>
          );
        })}
      </div>
    </FitnessCard>
  );
}
