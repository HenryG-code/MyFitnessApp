"use client";

import { CurrentPlanHero } from "@/components/training-plan/current-plan-hero";
import { GoalSelector } from "@/components/training-plan/goal-selector";
import { PlanOverview } from "@/components/training-plan/plan-overview";
import { SessionCard } from "@/components/training-plan/session-card";
import { FitnessCard } from "@/components/ui/fitness-card";
import { getTrainingPlanByGoal } from "@/src/lib/training-plans/data";
import { getNextTrainingSession } from "@/src/lib/training-plans/next-session";
import {
  defaultTrainingGoal,
  defaultTrainingLevel,
} from "@/src/lib/training-plans/types";
import {
  loadTrainingGoalFromStorage,
  loadTrainingLevelFromStorage,
  saveTrainingGoalToStorage,
  saveTrainingLevelToStorage,
} from "@/src/lib/training-plans/storage";
import type {
  TrainingGoal,
  TrainingLevel,
} from "@/src/lib/training-plans/types";
import {
  ensureUserPreferences,
  parseSelectedTrainingGoal,
  parseSelectedTrainingLevel,
  updateTrainingPlanSelection,
  announcePreferenceSyncStatus,
} from "@/src/lib/user-preferences/queries";
import {
  fetchWorkouts,
  type WorkoutListItem,
} from "@/src/lib/workouts/queries";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function TrainingPlanPage() {
  const [selectedGoal, setSelectedGoal] =
    useState<TrainingGoal>(defaultTrainingGoal);
  const [selectedLevel, setSelectedLevel] =
    useState<TrainingLevel>(defaultTrainingLevel);
  const [hasLoadedGoal, setHasLoadedGoal] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const selectedPlan = getTrainingPlanByGoal(selectedGoal, selectedLevel);
  const nextSession = getNextTrainingSession(selectedPlan, workouts);

  const refreshWorkoutHistory = useCallback(
    () =>
      fetchWorkouts()
        .then(setWorkouts)
        .catch(() => {
          // The plan still starts at day one if workout history is unavailable.
        }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function loadGoal() {
      const storedGoal = loadTrainingGoalFromStorage();
      const storedLevel = loadTrainingLevelFromStorage();
      setSelectedGoal(storedGoal);
      setSelectedLevel(storedLevel);

      try {
        const preferences = await ensureUserPreferences();
        const syncedGoal = parseSelectedTrainingGoal(preferences);
        const syncedLevel = parseSelectedTrainingLevel(preferences);

        if (syncedGoal) {
          if (isMounted) {
            setSelectedGoal(syncedGoal);
            setSelectedLevel(syncedLevel ?? storedLevel);
            saveTrainingGoalToStorage(syncedGoal);
            saveTrainingLevelToStorage(syncedLevel ?? storedLevel);
            announcePreferenceSyncStatus("synced");
          }
          if (!syncedLevel) {
            await updateTrainingPlanSelection(syncedGoal, storedLevel);
          }
        } else {
          await updateTrainingPlanSelection(storedGoal, storedLevel);
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
    void refreshWorkoutHistory();
  }, [refreshWorkoutHistory]);

  useEffect(() => {
    if (hasLoadedGoal) {
      saveTrainingGoalToStorage(selectedGoal);
      saveTrainingLevelToStorage(selectedLevel);
      updateTrainingPlanSelection(selectedGoal, selectedLevel).catch(() => {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      });
    }
  }, [hasLoadedGoal, selectedGoal, selectedLevel]);

  return (
    <div className="space-y-3 sm:space-y-5">
      <CurrentPlanHero plan={selectedPlan} nextSession={nextSession} />

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

      <div id="plan-builder" className="scroll-mt-4">
        <GoalSelector
          selectedGoal={selectedGoal}
          selectedLevel={selectedLevel}
          onChange={setSelectedGoal}
          onLevelChange={setSelectedLevel}
        />
      </div>
      <PlanOverview plan={selectedPlan} />

      <section className="min-w-0">
        <div className="mb-2 flex items-end justify-between gap-3 px-1 sm:mb-3">
          <div className="min-w-0">
            <p className="lf-eyebrow">Weekly schedule</p>
            <h2 className="mt-0.5 font-display text-lg font-black sm:text-xl">
              Your training days
            </h2>
          </div>
          <p className="shrink-0 text-[0.65rem] font-bold text-muted sm:text-xs">
            Tap a day for details
          </p>
        </div>
        <div className="grid min-w-0 gap-2 sm:gap-3 xl:grid-cols-2">
          {selectedPlan.days.map((session) => (
            <SessionCard
              key={`${selectedPlan.slug}-${session.dayLabel}`}
              plan={selectedPlan}
              session={session}
              onLogged={refreshWorkoutHistory}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
