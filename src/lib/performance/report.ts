import type { HabitDaySummary } from "@/src/lib/habits/queries";
import { getDateDaysAgo } from "@/src/lib/habits/queries";
import { buildStrengthTrends } from "@/src/lib/performance/journey";
import type { DatedExercise } from "@/src/lib/performance/muscles";
import type { WeightLog, Workout } from "@/src/lib/supabase/database.types";

export type ReportDelta = {
  label: string;
  current: string;
  change: string | null;
  direction: "up" | "down" | "flat";
  positive: boolean;
};

export type WeeklyReport = {
  weekLabel: string;
  narrative: string[];
  deltas: ReportDelta[];
  biggestWin: { title: string; detail: string };
  watchItem: { title: string; detail: string } | null;
  nextFocus: { title: string; detail: string };
  daysActive: number;
};

function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function avg(values: number[]) {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

export function buildWeeklyReport(input: {
  workouts: Workout[]; // last 14 days
  weights: WeightLog[]; // last 14 days (or more)
  habitDays: HabitDaySummary[]; // last 14 days
  exercises: DatedExercise[]; // last 14 days
}): WeeklyReport {
  const thisWeekStart = getDateDaysAgo(6);
  const lastWeekStart = getDateDaysAgo(13);
  const lastWeekEnd = getDateDaysAgo(7);
  const today = getDateDaysAgo(0);

  const thisWeek = input.workouts.filter((workout) =>
    inRange(workout.workout_date, thisWeekStart, today)
  );
  const lastWeek = input.workouts.filter((workout) =>
    inRange(workout.workout_date, lastWeekStart, lastWeekEnd)
  );

  const thisMinutes = thisWeek.reduce(
    (sum, workout) => sum + (workout.duration_minutes ?? 0),
    0
  );
  const lastMinutes = lastWeek.reduce(
    (sum, workout) => sum + (workout.duration_minutes ?? 0),
    0
  );

  const thisHabits = input.habitDays.filter((day) =>
    inRange(day.date, thisWeekStart, today)
  );
  const lastHabits = input.habitDays.filter((day) =>
    inRange(day.date, lastWeekStart, lastWeekEnd)
  );
  const thisHabitAvg = Math.round(avg(thisHabits.map((day) => day.percentage)));
  const lastHabitAvg = Math.round(avg(lastHabits.map((day) => day.percentage)));

  const weightsSorted = [...input.weights].sort((a, b) =>
    a.logged_at.localeCompare(b.logged_at)
  );
  const thisWeights = weightsSorted.filter((log) =>
    inRange(log.logged_at, thisWeekStart, today)
  );
  const beforeWeights = weightsSorted.filter(
    (log) => log.logged_at < thisWeekStart
  );
  const weightNow = thisWeights.length
    ? thisWeights[thisWeights.length - 1].weight_kg
    : null;
  const weightBefore = beforeWeights.length
    ? beforeWeights[beforeWeights.length - 1].weight_kg
    : null;
  const weightDelta =
    weightNow !== null && weightBefore !== null
      ? Math.round((weightNow - weightBefore) * 10) / 10
      : null;

  // Strength: best positive trend from the last 14 days.
  const trends = buildStrengthTrends(
    input.exercises.filter((exercise) =>
      inRange(exercise.workout_date, lastWeekStart, today)
    )
  );
  const strengthTrend = trends.length && trends[0].changePercent > 0 ? trends[0] : null;

  const daysActive = new Set(thisWeek.map((workout) => workout.workout_date))
    .size;

  const deltas: ReportDelta[] = [
    {
      label: "Workouts",
      current: `${thisWeek.length}`,
      change:
        lastWeek.length || thisWeek.length
          ? `${thisWeek.length - lastWeek.length >= 0 ? "+" : ""}${
              thisWeek.length - lastWeek.length
            } vs last week`
          : null,
      direction:
        thisWeek.length > lastWeek.length
          ? "up"
          : thisWeek.length < lastWeek.length
            ? "down"
            : "flat",
      positive: thisWeek.length >= lastWeek.length,
    },
    {
      label: "Training time",
      current: `${thisMinutes} min`,
      change:
        lastMinutes || thisMinutes
          ? `${thisMinutes - lastMinutes >= 0 ? "+" : ""}${
              thisMinutes - lastMinutes
            } min`
          : null,
      direction:
        thisMinutes > lastMinutes
          ? "up"
          : thisMinutes < lastMinutes
            ? "down"
            : "flat",
      positive: thisMinutes >= lastMinutes,
    },
    {
      label: "Habit average",
      current: `${thisHabitAvg}%`,
      change:
        thisHabitAvg || lastHabitAvg
          ? `${thisHabitAvg - lastHabitAvg >= 0 ? "+" : ""}${
              thisHabitAvg - lastHabitAvg
            } pts`
          : null,
      direction:
        thisHabitAvg > lastHabitAvg
          ? "up"
          : thisHabitAvg < lastHabitAvg
            ? "down"
            : "flat",
      positive: thisHabitAvg >= lastHabitAvg,
    },
    {
      label: "Weight",
      current: weightNow !== null ? `${weightNow.toFixed(1)} kg` : "—",
      change:
        weightDelta !== null
          ? `${weightDelta >= 0 ? "+" : ""}${weightDelta.toFixed(1)} kg`
          : null,
      direction:
        weightDelta === null || Math.abs(weightDelta) < 0.05
          ? "flat"
          : weightDelta > 0
            ? "up"
            : "down",
      positive: weightDelta === null ? true : weightDelta <= 0,
    },
  ];

  // Narrative
  const narrative: string[] = [];
  narrative.push(
    thisWeek.length
      ? `You trained ${thisWeek.length} time${thisWeek.length === 1 ? "" : "s"} across ${daysActive} day${daysActive === 1 ? "" : "s"}.`
      : "No sessions were logged this week."
  );

  if (thisMinutes > 0) {
    narrative.push(`You accumulated ${thisMinutes} training minutes.`);
  }

  if (weightDelta !== null) {
    narrative.push(
      Math.abs(weightDelta) < 0.05
        ? "Your weight held steady."
        : `Your weight ${weightDelta < 0 ? "decreased" : "increased"} ${Math.abs(weightDelta).toFixed(1)} kg.`
    );
  }

  if (strengthTrend) {
    narrative.push(
      `Your strongest improvement was ${strengthTrend.exerciseName.toLowerCase()} (+${strengthTrend.changePercent}%).`
    );
  }

  // Biggest win
  let biggestWin = {
    title: "You showed up",
    detail: "Every logged entry keeps the system honest.",
  };

  if (strengthTrend && strengthTrend.changePercent >= 5) {
    biggestWin = {
      title: `${strengthTrend.exerciseName} +${strengthTrend.changePercent}%`,
      detail: "Estimated strength moved meaningfully this week.",
    };
  } else if (thisWeek.length >= 4) {
    biggestWin = {
      title: `${thisWeek.length} sessions completed`,
      detail: "A full training week in the bank.",
    };
  } else if (weightDelta !== null && weightDelta <= -0.4) {
    biggestWin = {
      title: `${Math.abs(weightDelta).toFixed(1)} kg down`,
      detail: "The weight trend moved in your direction.",
    };
  } else if (thisHabitAvg >= 75) {
    biggestWin = {
      title: `${thisHabitAvg}% habit consistency`,
      detail: "Daily execution stayed strong all week.",
    };
  } else if (thisWeek.length > 0) {
    biggestWin = {
      title: `${thisWeek.length} session${thisWeek.length === 1 ? "" : "s"} logged`,
      detail: "Momentum preserved for next week.",
    };
  }

  // Watch item
  let watchItem: WeeklyReport["watchItem"] = null;

  const sleepDays = thisHabits.filter((day) => day.total > 0);
  if (thisWeek.length < lastWeek.length && lastWeek.length > 0) {
    watchItem = {
      title: "Training volume dipped",
      detail: `${thisWeek.length} sessions vs ${lastWeek.length} last week.`,
    };
  } else if (thisHabitAvg < lastHabitAvg - 10) {
    watchItem = {
      title: "Habit consistency slipped",
      detail: `${thisHabitAvg}% vs ${lastHabitAvg}% last week.`,
    };
  } else if (weightDelta !== null && weightDelta >= 0.7) {
    watchItem = {
      title: "Weight moved up",
      detail: `+${weightDelta.toFixed(1)} kg vs last check-in window.`,
    };
  } else if (thisWeights.length === 0 && beforeWeights.length > 0) {
    watchItem = {
      title: "No weight check-ins",
      detail: "One quick log keeps the trend readable.",
    };
  } else if (sleepDays.length && thisHabitAvg < 50) {
    watchItem = {
      title: "Daily habits under 50%",
      detail: "Pick one anchor habit to stabilise first.",
    };
  }

  // Next focus
  let nextFocus = {
    title: "Maintain volume, prioritise recovery",
    detail: "Repeat this week's structure and protect sleep.",
  };

  if (thisWeek.length === 0) {
    nextFocus = {
      title: "Log one session",
      detail: "One completed workout restarts the engine.",
    };
  } else if (thisWeek.length < 3) {
    nextFocus = {
      title: `Reach ${Math.min(thisWeek.length + 1, 4)} sessions`,
      detail: "Add one more session than this week.",
    };
  } else if (watchItem?.title === "Habit consistency slipped") {
    nextFocus = {
      title: "Rebuild the daily baseline",
      detail: "Target 70%+ habit completion each day.",
    };
  } else if (thisMinutes > 360) {
    nextFocus = {
      title: "Deload slightly",
      detail: "Trim volume 20% and bank recovery.",
    };
  }

  const weekLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${thisWeekStart}T00:00:00`));

  return {
    weekLabel: `Week of ${weekLabel}`,
    narrative,
    deltas,
    biggestWin,
    watchItem,
    nextFocus,
    daysActive,
  };
}
