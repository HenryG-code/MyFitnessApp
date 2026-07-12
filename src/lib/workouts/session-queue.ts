import type {
  TrainingExercise,
  TrainingSession,
} from "@/src/lib/training-plans/types";

export type LoggedSet = { weight: number | null; reps: number | null };

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
