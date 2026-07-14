import type {
  TrainingExercise,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import { estimateOneRepMax } from "@/src/lib/performance/history";

export type LoggedSet = { weight: number | null; reps: number | null };

function representativeSetScore(set: LoggedSet) {
  return estimateOneRepMax(set.weight, set.reps) ?? 0;
}

/**
 * Keeps the saved weight and reps tied to one real set. Loaded sets are ranked
 * by a conservative estimated max, then by weight and reps for stable ties.
 */
export function selectRepresentativeLoggedSet(
  sets: LoggedSet[]
): LoggedSet | null {
  if (sets.length === 0) {
    return null;
  }

  const loadedSets = sets.filter((set) => (set.weight ?? 0) > 0);
  const candidates = loadedSets.length > 0 ? loadedSets : sets;

  return candidates.reduce((best, candidate) => {
    const scoreDifference =
      representativeSetScore(candidate) - representativeSetScore(best);

    if (scoreDifference !== 0) {
      return scoreDifference > 0 ? candidate : best;
    }

    const weightDifference =
      (candidate.weight ?? 0) - (best.weight ?? 0);
    if (weightDifference !== 0) {
      return weightDifference > 0 ? candidate : best;
    }

    return (candidate.reps ?? 0) > (best.reps ?? 0) ? candidate : best;
  });
}

export type QueueExercise = {
  name: string;
  targetSets: number;
  targetReps: number | null;
  restSeconds: number;
  timed: boolean;
  durationMinutes: number | null;
  notes?: string;
  logged: LoggedSet[];
  skipped: boolean;
};

export function parseFirstNumber(value: string | undefined) {
  const match = value?.match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

export function buildQueue(session: TrainingSession): QueueExercise[] {
  return session.exercises.map((exercise: TrainingExercise) => {
    const timed = !exercise.sets && !exercise.reps && Boolean(exercise.duration);

    return {
      name: exercise.name,
      targetSets: timed ? 1 : (exercise.sets ?? 3),
      targetReps: parseFirstNumber(exercise.reps),
      restSeconds: parseFirstNumber(exercise.rest) ?? 75,
      timed,
      durationMinutes: parseFirstNumber(exercise.duration),
      notes: exercise.notes,
      logged: [],
      skipped: false,
    };
  });
}

export function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
