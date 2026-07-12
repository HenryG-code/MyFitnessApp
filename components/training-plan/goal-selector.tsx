"use client";

import {
  trainingGoals,
  trainingLevels,
  type TrainingGoal,
  type TrainingLevel,
} from "@/src/lib/training-plans/types";
import { CalendarDays, Target } from "lucide-react";
import { FitnessCard } from "@/components/ui/fitness-card";

type GoalSelectorProps = {
  selectedGoal: TrainingGoal;
  selectedLevel: TrainingLevel;
  onChange: (goal: TrainingGoal) => void;
  onLevelChange: (level: TrainingLevel) => void;
};

const levelDetails: Record<
  TrainingLevel,
  { schedule: string; description: string }
> = {
  Beginner: {
    schedule: "4 days / week",
    description: "Build consistency with more recovery between sessions.",
  },
  Intermediate: {
    schedule: "5 days / week",
    description: "Increase training frequency with focused daily sessions.",
  },
};

export function GoalSelector({
  selectedGoal,
  selectedLevel,
  onChange,
  onLevelChange,
}: GoalSelectorProps) {
  return (
    <FitnessCard className="!p-3 sm:!p-5">
      <div className="mb-3 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-accent text-stone-950 sm:size-12 sm:rounded-2xl">
          <Target className="size-5" />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Plan builder
          </p>
          <h2 className="font-display text-lg font-black sm:text-2xl">
            Choose your goal and schedule
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {trainingLevels.map((level) => {
          const active = level === selectedLevel;
          const detail = levelDetails[level];

          return (
            <button
              key={level}
              type="button"
              onClick={() => onLevelChange(level)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left outline-none transition focus-visible:ring-4 focus-visible:ring-accent/35 sm:rounded-2xl sm:p-4 ${
                active
                  ? "border-accent bg-accent text-white shadow-lg shadow-accent/20"
                  : "border-line/80 bg-white/75 text-foreground hover:border-accent"
              }`}
            >
              <span className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                <span className="font-display text-sm font-black sm:text-lg">
                  {level}
                </span>
              </span>
              <span className={`mt-2 block text-xs font-black ${active ? "text-red-50/90" : "text-accent-strong"}`}>
                {detail.schedule}
              </span>
              <span className={`mt-1 hidden text-sm leading-6 sm:block ${active ? "text-red-50/90" : "text-muted"}`}>
                {detail.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
          Training goal
        </p>
        <p className="text-xs font-bold text-muted">
          {levelDetails[selectedLevel].schedule}
        </p>
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
                {selectedLevel} · {levelDetails[selectedLevel].schedule}
              </span>
            </button>
          );
        })}
      </div>
    </FitnessCard>
  );
}
