import { getDateInputValue } from "@/src/lib/habits/queries";
import {
  estimateOneRepMax,
  normalizeExerciseName,
} from "@/src/lib/performance/history";
import type { DatedExercise } from "@/src/lib/performance/muscles";
import type { WeightLog, Workout } from "@/src/lib/supabase/database.types";

export type MilestoneKind =
  | "start"
  | "weight"
  | "workouts"
  | "strength"
  | "streak"
  | "current";

export type Milestone = {
  date: string;
  kind: MilestoneKind;
  title: string;
  value: string;
  detail: string;
};

export type StrengthTrend = {
  liftId: OneRepMaxLiftId;
  exerciseName: string;
  firstOneRepMax: number;
  bestOneRepMax: number;
  lastOneRepMax: number;
  changePercent: number;
  sessions: number;
};

export type JourneySummary = {
  weightChangeKg: number | null;
  weightDirection: "down" | "up" | "flat" | null;
  totalWorkouts: number;
  totalMinutes: number;
  strongestImprovement: StrengthTrend | null;
  consistencyPercent: number;
  daysTracked: number;
};

function formatKg(value: number) {
  return `${value.toFixed(1)} kg`;
}

export const ONE_REP_MAX_LIFTS = [
  {
    id: "bench-press",
    name: "Bench Press",
    shortName: "Bench",
    aliases: [
      "bench press",
      "barbell bench press",
      "flat bench press",
      "flat barbell bench press",
    ],
  },
  {
    id: "back-squat",
    name: "Back Squat",
    shortName: "Squat",
    aliases: [
      "squat",
      "back squat",
      "barbell squat",
      "barbell back squat",
      "high bar back squat",
      "low bar back squat",
    ],
  },
  {
    id: "deadlift",
    name: "Deadlift",
    shortName: "Deadlift",
    aliases: [
      "deadlift",
      "barbell deadlift",
      "conventional deadlift",
      "sumo deadlift",
    ],
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    shortName: "OHP",
    aliases: [
      "overhead press",
      "barbell overhead press",
      "standing overhead press",
      "standing barbell overhead press",
      "strict press",
      "military press",
      "barbell military press",
      "ohp",
    ],
  },
] as const;

export type OneRepMaxLiftId = (typeof ONE_REP_MAX_LIFTS)[number]["id"];

/** Resolve plan/history aliases to one of the four classic heavy barbell lifts. */
export function getOneRepMaxLift(name: string) {
  const normalized = normalizeExerciseName(name);

  return (
    ONE_REP_MAX_LIFTS.find((lift) =>
      lift.aliases.some((alias) => alias === normalized)
    ) ?? null
  );
}

/** Keep the strength tracker focused on canonical, safely testable barbell lifts. */
export function isOneRepMaxLift(name: string) {
  return getOneRepMaxLift(name) !== null;
}

/**
 * Conservative rep-based projection: 80 kg for five clean reps becomes an
 * 85 kg estimated 1RM. The Epley result acts only as an upper safety bound.
 */
export function estimateTrackedOneRepMax(
  workingWeight: number | null,
  reps: number | null
): number | null {
  return estimateOneRepMax(workingWeight, reps);
}

export function suggestNextOneRepMax(input: {
  workingWeight: number;
  reps: number | null;
}): number | null {
  return estimateTrackedOneRepMax(input.workingWeight, input.reps);
}

export function buildStrengthTrends(
  exercises: DatedExercise[]
): StrengthTrend[] {
  const byExercise = new Map<
    OneRepMaxLiftId,
    {
      liftId: OneRepMaxLiftId;
      name: string;
      points: Array<{ date: string; orm: number }>;
    }
  >();

  exercises.forEach((exercise) => {
    const lift = getOneRepMaxLift(exercise.exercise_name);
    if (!lift) {
      return;
    }

    const orm = estimateTrackedOneRepMax(exercise.weight, exercise.reps);
    if (orm === null) {
      return;
    }

    const entry =
      byExercise.get(lift.id) ?? {
        liftId: lift.id,
        name: lift.name,
        points: [],
      };
    entry.points.push({ date: exercise.workout_date, orm });
    byExercise.set(lift.id, entry);
  });

  const trends: StrengthTrend[] = [];

  byExercise.forEach((entry) => {
    entry.points.sort((a, b) => a.date.localeCompare(b.date));
    const first = entry.points[0].orm;
    const last = entry.points[entry.points.length - 1].orm;
    const best = Math.max(...entry.points.map((point) => point.orm));

    trends.push({
      liftId: entry.liftId,
      exerciseName: entry.name,
      firstOneRepMax: first,
      bestOneRepMax: best,
      lastOneRepMax: last,
      changePercent: first > 0 ? Math.round(((last - first) / first) * 100) : 0,
      sessions: entry.points.length,
    });
  });

  return trends.sort((a, b) => b.changePercent - a.changePercent);
}

export function buildMilestones(input: {
  weights: WeightLog[];
  workouts: Workout[];
  exercises: DatedExercise[];
  bestStreak: number;
}): Milestone[] {
  const milestones: Milestone[] = [];
  const weights = [...input.weights].sort((a, b) =>
    a.logged_at.localeCompare(b.logged_at)
  );
  const workouts = [...input.workouts].sort((a, b) =>
    a.workout_date.localeCompare(b.workout_date)
  );

  if (weights.length) {
    milestones.push({
      date: weights[0].logged_at,
      kind: "start",
      title: "Starting point",
      value: formatKg(weights[0].weight_kg),
      detail: "First weight check-in logged.",
    });
  } else if (workouts.length) {
    milestones.push({
      date: workouts[0].workout_date,
      kind: "start",
      title: "Starting point",
      value: workouts[0].title,
      detail: "First training session logged.",
    });
  }

  // Weight milestones: every full 2 kg moved from the start.
  if (weights.length >= 2) {
    const startKg = weights[0].weight_kg;
    let nextThreshold = 2;

    weights.forEach((log) => {
      const moved = Math.abs(log.weight_kg - startKg);
      if (moved >= nextThreshold) {
        const direction = log.weight_kg < startKg ? "lost" : "gained";
        milestones.push({
          date: log.logged_at,
          kind: "weight",
          title: `${nextThreshold} kg ${direction}`,
          value: formatKg(log.weight_kg),
          detail: `Total ${direction}: ${moved.toFixed(1)} kg since the start.`,
        });
        nextThreshold += 2;
      }
    });
  }

  // Every 10 workouts completed.
  workouts.forEach((workout, index) => {
    const count = index + 1;
    if (count % 10 === 0) {
      milestones.push({
        date: workout.workout_date,
        kind: "workouts",
        title: `${count} workouts completed`,
        value: `#${count}`,
        detail: `"${workout.title}" marked session ${count}.`,
      });
    }
  });

  // Strength PRs: first time each big lift beats its previous best est. 1RM by 5%+.
  const bestByExercise = new Map<string, number>();
  const sortedExercises = [...input.exercises].sort((a, b) =>
    a.workout_date.localeCompare(b.workout_date)
  );

  sortedExercises.forEach((exercise) => {
    const lift = getOneRepMaxLift(exercise.exercise_name);
    if (!lift) {
      return;
    }

    const orm = estimateTrackedOneRepMax(exercise.weight, exercise.reps);
    if (orm === null) {
      return;
    }

    const key = lift.id;
    const best = bestByExercise.get(key);

    if (best !== undefined && orm >= best * 1.05 && orm - best >= 2.5) {
      milestones.push({
        date: exercise.workout_date,
        kind: "strength",
        title: `${lift.name} PR`,
        value: `${exercise.weight} kg × ${exercise.reps ?? 1}`,
        detail: `Estimated 1RM up to ${orm.toFixed(0)} kg.`,
      });
    }

    if (best === undefined || orm > best) {
      bestByExercise.set(key, orm);
    }
  });

  if (input.bestStreak >= 3) {
    milestones.push({
      date: getDateInputValue(),
      kind: "streak",
      title: "Consistency record",
      value: `${input.bestStreak} days`,
      detail: "Longest run of consecutive active days.",
    });
  }

  if (weights.length >= 2) {
    const latest = weights[weights.length - 1];
    milestones.push({
      date: latest.logged_at,
      kind: "current",
      title: "Where you are now",
      value: formatKg(latest.weight_kg),
      detail: `${Math.abs(latest.weight_kg - weights[0].weight_kg).toFixed(1)} kg ${
        latest.weight_kg <= weights[0].weight_kg ? "down" : "up"
      } from the start.`,
    });
  }

  return milestones
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);
}

export function calculateBestStreak(activeDates: string[]) {
  const dates = [...new Set(activeDates)].sort();
  let best = 0;
  let run = 0;
  let previous: string | null = null;

  dates.forEach((date) => {
    if (previous) {
      const gap = Math.round(
        (new Date(`${date}T00:00:00`).getTime() -
          new Date(`${previous}T00:00:00`).getTime()) /
          86_400_000
      );
      run = gap === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }

    best = Math.max(best, run);
    previous = date;
  });

  return best;
}

export function buildJourneySummary(input: {
  weights: WeightLog[];
  workouts: Workout[];
  exercises: DatedExercise[];
  activeDays: number;
  daysTracked: number;
}): JourneySummary {
  const weights = [...input.weights].sort((a, b) =>
    a.logged_at.localeCompare(b.logged_at)
  );
  const weightChangeKg =
    weights.length >= 2
      ? Math.round(
          (weights[weights.length - 1].weight_kg - weights[0].weight_kg) * 10
        ) / 10
      : null;
  const trends = buildStrengthTrends(input.exercises).filter(
    (trend) => trend.sessions >= 2
  );

  return {
    weightChangeKg,
    weightDirection:
      weightChangeKg === null
        ? null
        : weightChangeKg < -0.1
          ? "down"
          : weightChangeKg > 0.1
            ? "up"
            : "flat",
    totalWorkouts: input.workouts.length,
    totalMinutes: input.workouts.reduce(
      (sum, workout) => sum + (workout.duration_minutes ?? 0),
      0
    ),
    strongestImprovement: trends.length ? trends[0] : null,
    consistencyPercent:
      input.daysTracked > 0
        ? Math.min(
            100,
            Math.round((input.activeDays / input.daysTracked) * 100)
          )
        : 0,
    daysTracked: input.daysTracked,
  };
}
