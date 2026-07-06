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

export function buildStrengthTrends(
  exercises: DatedExercise[]
): StrengthTrend[] {
  const byExercise = new Map<
    string,
    { name: string; points: Array<{ date: string; orm: number }> }
  >();

  exercises.forEach((exercise) => {
    const orm = estimateOneRepMax(exercise.weight, exercise.reps);
    if (orm === null) {
      return;
    }

    const key = normalizeExerciseName(exercise.exercise_name);
    const entry =
      byExercise.get(key) ?? { name: exercise.exercise_name, points: [] };
    entry.points.push({ date: exercise.workout_date, orm });
    byExercise.set(key, entry);
  });

  const trends: StrengthTrend[] = [];

  byExercise.forEach((entry) => {
    if (entry.points.length < 2) {
      return;
    }

    entry.points.sort((a, b) => a.date.localeCompare(b.date));
    const first = entry.points[0].orm;
    const last = entry.points[entry.points.length - 1].orm;
    const best = Math.max(...entry.points.map((point) => point.orm));

    trends.push({
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
    const orm = estimateOneRepMax(exercise.weight, exercise.reps);
    if (orm === null) {
      return;
    }

    const key = normalizeExerciseName(exercise.exercise_name);
    const best = bestByExercise.get(key);

    if (best !== undefined && orm >= best * 1.05 && orm - best >= 2.5) {
      milestones.push({
        date: exercise.workout_date,
        kind: "strength",
        title: `${exercise.exercise_name} PR`,
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
