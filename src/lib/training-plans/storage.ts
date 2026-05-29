import {
  defaultTrainingGoal,
  trainingGoals,
} from "@/src/lib/training-plans/data";
import type { TrainingGoal } from "@/src/lib/training-plans/types";

export const trainingGoalStorageKey = "liftlog-training-goal-v1";

export function isTrainingGoal(value: unknown): value is TrainingGoal {
  return (
    typeof value === "string" &&
    trainingGoals.includes(value as TrainingGoal)
  );
}

export function loadTrainingGoalFromStorage() {
  if (typeof window === "undefined") {
    return defaultTrainingGoal;
  }

  const savedGoal = window.localStorage.getItem(trainingGoalStorageKey);

  return isTrainingGoal(savedGoal) ? savedGoal : defaultTrainingGoal;
}

export function saveTrainingGoalToStorage(goal: TrainingGoal) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(trainingGoalStorageKey, goal);
}
