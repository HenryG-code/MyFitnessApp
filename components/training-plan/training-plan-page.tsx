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
import {
  ensureUserPreferences,
  parseSelectedTrainingGoal,
  updateSelectedTrainingGoal,
  announcePreferenceSyncStatus,
} from "@/src/lib/user-preferences/queries";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { AlertTriangle, Dumbbell, HeartPulse, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

export function TrainingPlanPage() {
  const [selectedGoal, setSelectedGoal] =
    useState<TrainingGoal>(defaultTrainingGoal);
  const [hasLoadedGoal, setHasLoadedGoal] = useState(false);
  const selectedPlan = getTrainingPlanByGoal(selectedGoal);

  useEffect(() => {
    let isMounted = true;

    async function loadGoal() {
      const storedGoal = loadTrainingGoalFromStorage();
      setSelectedGoal(storedGoal);

      try {
        const preferences = await ensureUserPreferences();
        const syncedGoal = parseSelectedTrainingGoal(preferences);

        if (syncedGoal) {
          if (isMounted) {
            setSelectedGoal(syncedGoal);
            saveTrainingGoalToStorage(syncedGoal);
            announcePreferenceSyncStatus("synced");
          }
        } else {
          await updateSelectedTrainingGoal(storedGoal);
        }
      } catch {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      } finally {
        if (isMounted) {
          setHasLoadedGoal(true);
        }
      }
    }

    void loadGoal();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedGoal) {
      saveTrainingGoalToStorage(selectedGoal);
      updateSelectedTrainingGoal(selectedGoal).catch(() => {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      });
    }
  }, [hasLoadedGoal, selectedGoal]);

  return (
    <div className="space-y-3 sm:space-y-5">
      <HeroPanel
        eyebrow="Suggested training plan"
        title="Suggested training plan"
        description="Choose your goal and get a balanced weekly routine."
        imageSrc={fitnessImages.cardioRunner}
        imageAlt="Runner doing cardio training"
        variant="amber"
      >

        <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
          <div className="rounded-xl bg-white/10 p-2.5 sm:rounded-[1.5rem] sm:p-4">
            <Dumbbell className="size-4 text-sun sm:size-5" />
            <p className="mt-2 text-sm font-black sm:mt-3 sm:text-2xl">Strength</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-stone-300 sm:text-sm sm:leading-normal">Major muscles twice weekly</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 sm:rounded-[1.5rem] sm:p-4">
            <HeartPulse className="size-4 text-sun sm:size-5" />
            <p className="mt-2 text-sm font-black sm:mt-3 sm:text-2xl">Cardio</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-stone-300 sm:text-sm sm:leading-normal">Moderate weekly activity</p>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 sm:rounded-[1.5rem] sm:p-4">
            <ShieldCheck className="size-4 text-sun sm:size-5" />
            <p className="mt-2 text-sm font-black sm:mt-3 sm:text-2xl">Recovery</p>
            <p className="mt-0.5 text-[0.65rem] leading-tight text-stone-300 sm:text-sm sm:leading-normal">Gradual and sustainable</p>
          </div>
        </div>
      </HeroPanel>

      <FitnessCard className="border-warning/30 bg-warning/10 !p-3 sm:!p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-sun text-stone-950 sm:size-11 sm:rounded-2xl">
            <AlertTriangle className="size-5" />
          </span>
          <p className="text-xs font-bold leading-5 text-muted sm:text-sm sm:leading-6">
            These plans are general fitness suggestions, not medical advice.
            Start light, use proper form, and consult a professional if you have
            injuries or medical conditions.
          </p>
        </div>
      </FitnessCard>

      <GoalSelector selectedGoal={selectedGoal} onChange={setSelectedGoal} />
      <PlanOverview plan={selectedPlan} />

      <section className="grid gap-3 sm:gap-5 xl:grid-cols-2">
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
