import {
  defaultTrainingGoal,
  defaultTrainingLevel,
  trainingGoals,
  trainingLevels,
} from "@/src/lib/training-plans/data";
import type {
  TrainingGoal,
  TrainingLevel,
} from "@/src/lib/training-plans/types";

export const trainingGoalStorageKey = "liftlog-training-goal-v1";
export const trainingLevelStorageKey = "logfit-training-level-v1";

export function isTrainingGoal(value: unknown): value is TrainingGoal {
  return (
    typeof value === "string" &&
    trainingGoals.includes(value as TrainingGoal)
  );
}

export function isTrainingLevel(value: unknown): value is TrainingLevel {
  return (
    typeof value === "string" &&
    trainingLevels.includes(value as TrainingLevel)
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

export function loadTrainingLevelFromStorage() {
  if (typeof window === "undefined") {
    return defaultTrainingLevel;
  }

  const savedLevel = window.localStorage.getItem(trainingLevelStorageKey);

  return isTrainingLevel(savedLevel) ? savedLevel : defaultTrainingLevel;
}

export function saveTrainingLevelToStorage(level: TrainingLevel) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(trainingLevelStorageKey, level);
}
