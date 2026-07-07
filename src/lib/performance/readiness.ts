import type { HabitDaySummary } from "@/src/lib/habits/queries";
import { getDateDaysAgo, getDateInputValue } from "@/src/lib/habits/queries";
import {
  formatSleep,
  restingHeartRateBaseline,
} from "@/src/lib/health/queries";
import type {
  HabitCompletion,
  HabitDefinition,
  HealthDailyMetric,
  Workout,
} from "@/src/lib/supabase/database.types";

export type ReadinessState = "primed" | "ready" | "steady" | "recover";

export type ReadinessComponent = {
  label: string;
  score: number;
  detail: string;
};

export type Readiness = {
  score: number;
  state: ReadinessState;
  headline: string;
  guidance: string;
  components: ReadinessComponent[];
};

export type WeeklyLoad = {
  label: "Light" | "Building" | "Optimal" | "High";
  minutes: number;
  sessions: number;
  detail: string;
};

function findHabitId(definitions: HabitDefinition[], keyword: string) {
  return definitions.find((habit) =>
    habit.name.toLowerCase().includes(keyword)
  )?.id;
}

function wasHabitCompletedOn(
  completions: HabitCompletion[],
  habitId: string | undefined,
  date: string
) {
  if (!habitId) {
    return null;
  }

  return completions.some(
    (completion) =>
      completion.habit_id === habitId &&
      completion.completed_date === date &&
      completion.is_completed
  );
}

function daysSinceLastWorkout(workouts: Workout[]) {
  if (!workouts.length) {
    return null;
  }

  const today = new Date(`${getDateInputValue()}T00:00:00`);
  const latest = workouts.reduce((max, workout) =>
    workout.workout_date > max.workout_date ? workout : max
  );
  const last = new Date(`${latest.workout_date}T00:00:00`);

  return Math.max(
    0,
    Math.round((today.getTime() - last.getTime()) / 86_400_000)
  );
}

/** Deterministic sleep score from synced sleep minutes. */
function scoreSyncedSleep(minutes: number) {
  if (minutes >= 450) return 96;
  if (minutes >= 420) return 90;
  if (minutes >= 360) return 74;
  if (minutes >= 300) return 58;
  return 45;
}

/**
 * Deterministic fitness-guidance readiness score from logged data.
 * Not a medical measurement — a training heuristic.
 *
 * Fallback hierarchy: synced health data (when connected) → manual habits →
 * neutral baseline. Never depends on a single fragile metric.
 */
export function calculateReadiness(input: {
  workoutsLastSevenDays: Workout[];
  recentHabits: HabitDaySummary[];
  habitDefinitions: HabitDefinition[];
  recentHabitCompletions: HabitCompletion[];
  healthToday?: HealthDailyMetric | null;
  healthRecent?: HealthDailyMetric[];
}): Readiness {
  const yesterday = getDateDaysAgo(1);
  const sleepHabitId = findHabitId(input.habitDefinitions, "sleep");
  const alcoholHabitId = findHabitId(input.habitDefinitions, "alcohol");

  // Recovery: rest since last session.
  const restDays = daysSinceLastWorkout(input.workoutsLastSevenDays);
  let recoveryScore = 72;
  let recoveryDetail = "No sessions logged yet.";

  if (restDays === 0) {
    recoveryScore = 58;
    recoveryDetail = "You already trained today.";
  } else if (restDays === 1) {
    recoveryScore = 96;
    recoveryDetail = "One full rest day banked.";
  } else if (restDays === 2) {
    recoveryScore = 90;
    recoveryDetail = "Fully recovered and fresh.";
  } else if (restDays !== null) {
    recoveryScore = 78;
    recoveryDetail = `${restDays} days since your last session.`;
  }

  // Sleep: prefer real synced sleep (last night is stored under today's
  // date), fall back to the manual sleep habit, then a neutral baseline.
  const syncedSleepMinutes =
    input.healthToday?.sleep_minutes ??
    input.healthRecent?.find(
      (metric) => metric.metric_date === yesterday && metric.sleep_minutes
    )?.sleep_minutes ??
    null;
  let sleepScore: number;
  let sleepDetail: string;

  if (syncedSleepMinutes !== null) {
    sleepScore = scoreSyncedSleep(syncedSleepMinutes);
    sleepDetail = `${formatSleep(syncedSleepMinutes)} synced sleep.`;
  } else {
    const sleptWell = wasHabitCompletedOn(
      input.recentHabitCompletions,
      sleepHabitId,
      yesterday
    );
    sleepScore = sleptWell === null ? 70 : sleptWell ? 96 : 52;
    sleepDetail =
      sleptWell === null
        ? "No sleep habit logged yesterday."
        : sleptWell
          ? "Sleep habit hit yesterday."
          : "Short sleep logged yesterday.";
  }

  // Resting-HR trend vs personal baseline (conservative, needs 3+ days).
  const rhrToday = input.healthToday?.resting_heart_rate_bpm ?? null;
  const rhrBaseline = input.healthRecent
    ? restingHeartRateBaseline(
        input.healthRecent,
        input.healthToday?.metric_date
      )
    : null;
  let rhrAdjustment = 0;
  let rhrNote: string | null = null;

  if (rhrToday !== null && rhrBaseline !== null) {
    if (rhrToday >= rhrBaseline + 5) {
      rhrAdjustment = -8;
      rhrNote = "Resting HR is above your recent baseline.";
    } else if (rhrToday <= rhrBaseline + 1) {
      rhrAdjustment = 3;
      rhrNote = "Resting HR is at or below your baseline.";
    }
  }

  // Lifestyle: alcohol habit yesterday.
  const stayedClean = wasHabitCompletedOn(
    input.recentHabitCompletions,
    alcoholHabitId,
    yesterday
  );

  // Consistency: 7-day habit average.
  const habitAverage = input.recentHabits.length
    ? Math.round(
        input.recentHabits.reduce((sum, day) => sum + day.percentage, 0) /
          input.recentHabits.length
      )
    : 0;
  const consistencyScore = Math.min(100, 40 + habitAverage * 0.6);

  // Load balance vs a 150–360 weekly-minute band.
  const minutes = input.workoutsLastSevenDays.reduce(
    (sum, workout) => sum + (workout.duration_minutes ?? 0),
    0
  );
  let loadScore = 70;
  let loadDetail = "Room for more volume this week.";

  if (minutes >= 150 && minutes <= 360) {
    loadScore = 95;
    loadDetail = "Weekly load is in the productive band.";
  } else if (minutes > 360) {
    loadScore = 55;
    loadDetail = "High accumulated load — watch recovery.";
  } else if (minutes > 0) {
    loadScore = 78;
    loadDetail = `${minutes} min logged in the last 7 days.`;
  }

  const components: ReadinessComponent[] = [
    {
      label: "Recovery",
      score: Math.round(
        Math.max(0, Math.min(100, recoveryScore + rhrAdjustment))
      ),
      detail: rhrNote ? `${recoveryDetail} ${rhrNote}` : recoveryDetail,
    },
    { label: "Sleep", score: sleepScore, detail: sleepDetail },
    {
      label: "Consistency",
      score: Math.round(consistencyScore),
      detail: `${habitAverage}% habit average this week.`,
    },
    { label: "Load", score: loadScore, detail: loadDetail },
  ];

  let score = Math.round(
    (recoveryScore + rhrAdjustment) * 0.34 +
      sleepScore * 0.26 +
      consistencyScore * 0.2 +
      loadScore * 0.2
  );

  if (stayedClean === false) {
    score = Math.max(0, score - 6);
  }

  score = Math.max(0, Math.min(100, score));

  const state: ReadinessState =
    score >= 85 ? "primed" : score >= 68 ? "ready" : score >= 50 ? "steady" : "recover";

  const headline = {
    primed: "Primed",
    ready: "Ready",
    steady: "Steady",
    recover: "Recover",
  }[state];

  const guidance = {
    primed: "Green light for a high-intensity session.",
    ready: "Good day to train — push your planned session.",
    steady: "Train, but keep intensity controlled today.",
    recover: "Favor movement and recovery over intensity.",
  }[state];

  return { score, state, headline, guidance, components };
}

export function classifyWeeklyLoad(workouts: Workout[]): WeeklyLoad {
  const minutes = workouts.reduce(
    (sum, workout) => sum + (workout.duration_minutes ?? 0),
    0
  );
  const sessions = workouts.length;

  if (minutes > 360 || sessions >= 6) {
    return {
      label: "High",
      minutes,
      sessions,
      detail: "Heavy week — protect sleep and recovery.",
    };
  }

  if (minutes >= 150 || sessions >= 3) {
    return {
      label: "Optimal",
      minutes,
      sessions,
      detail: "You are in the productive training band.",
    };
  }

  if (minutes > 0) {
    return {
      label: "Building",
      minutes,
      sessions,
      detail: "Momentum started — add one more session.",
    };
  }

  return {
    label: "Light",
    minutes,
    sessions,
    detail: "No load yet this week.",
  };
}

/**
 * Consecutive active days ending today or yesterday. A day counts when a
 * workout was logged or the "Trained" habit was completed.
 */
export function calculateTrainingStreak(input: {
  workoutDates: string[];
  habitDefinitions: HabitDefinition[];
  habitCompletions: HabitCompletion[];
}) {
  const trainedHabitId = findHabitId(input.habitDefinitions, "train");
  const activeDates = new Set(input.workoutDates);

  input.habitCompletions.forEach((completion) => {
    if (
      completion.is_completed &&
      trainedHabitId &&
      completion.habit_id === trainedHabitId
    ) {
      activeDates.add(completion.completed_date);
    }
  });

  let streak = 0;
  let offset = activeDates.has(getDateInputValue()) ? 0 : 1;

  for (; ; offset += 1) {
    if (activeDates.has(getDateDaysAgo(offset))) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}
