"use client";

import { GoalSelector } from "@/components/training-plan/goal-selector";
import { PlanOverview } from "@/components/training-plan/plan-overview";
import { SessionCard } from "@/components/training-plan/session-card";
import { FitnessCard } from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import {
  defaultTrainingGoal,
  getTrainingPlanByGoal,
} from "@/src/lib/training-plans/data";
import {
  loadTrainingGoalFromStorage,
  saveTrainingGoalToStorage,
} from "@/src/lib/training-plans/storage";
import type { TrainingGoal } from "@/src/lib/training-plans/types";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { AlertTriangle, Dumbbell, HeartPulse, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function TrainingPlanPage() {
  const [selectedGoal, setSelectedGoal] =
    useState<TrainingGoal>(defaultTrainingGoal);
  const [hasLoadedGoal, setHasLoadedGoal] = useState(false);
  const selectedPlan = getTrainingPlanByGoal(selectedGoal);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSelectedGoal(loadTrainingGoalFromStorage());
      setHasLoadedGoal(true);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (hasLoadedGoal) {
      saveTrainingGoalToStorage(selectedGoal);
    }
  }, [hasLoadedGoal, selectedGoal]);

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Suggested training plan"
        title="Suggested training plan"
        description="Choose your goal and get a balanced weekly routine."
        imageSrc={fitnessImages.cardioRunner}
        imageAlt="Runner doing cardio training"
        variant="amber"
      >

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <Dumbbell className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Strength</p>
            <p className="text-sm text-stone-300">Major muscles twice weekly</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <HeartPulse className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Cardio</p>
            <p className="text-sm text-stone-300">Moderate weekly activity</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <ShieldCheck className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Recovery</p>
            <p className="text-sm text-stone-300">Gradual and sustainable</p>
          </div>
        </div>
      </HeroPanel>

      <FitnessCard className="border-amber-200 bg-amber-50/80">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sun text-stone-950">
            <AlertTriangle className="size-5" />
          </span>
          <p className="text-sm font-bold leading-6 text-muted">
            These plans are general fitness suggestions, not medical advice.
            Start light, use proper form, and consult a professional if you have
            injuries or medical conditions.
          </p>
        </div>
      </FitnessCard>

      <GoalSelector selectedGoal={selectedGoal} onChange={setSelectedGoal} />
      <PlanOverview plan={selectedPlan} />

      <section className="grid gap-5 xl:grid-cols-2">
        {selectedPlan.days.map((session) => (
          <SessionCard
            key={`${selectedPlan.slug}-${session.dayLabel}`}
            plan={selectedPlan}
            session={session}
          />
        ))}
      </section>
    </div>
  );
}
