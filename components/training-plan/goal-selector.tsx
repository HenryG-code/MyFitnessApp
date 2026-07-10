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
    <FitnessCard className="!p-3 sm:!p-5">
      <div className="mb-3 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
          <Target className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Goal selector
          </p>
          <h2 className="font-display text-lg font-black sm:text-2xl">
            Choose your training focus
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-3">
        {trainingGoals.map((goal) => {
          const active = goal === selectedGoal;

          return (
            <button
              key={goal}
              type="button"
              onClick={() => onChange(goal)}
              className={`rounded-xl border px-2.5 py-3 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.28)] focus-visible:ring-4 focus-visible:ring-accent/35 sm:rounded-2xl sm:px-4 sm:py-4 ${
                active
                  ? "liftlog-active-item border-accent bg-accent text-white shadow-lg shadow-accent/20"
                  : "border-line/80 bg-white/75 text-foreground hover:border-accent"
              }`}
            >
              <span className="font-display text-sm font-black sm:text-lg">{goal}</span>
              <span
                className={`mt-1 hidden text-sm leading-6 sm:block ${
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
