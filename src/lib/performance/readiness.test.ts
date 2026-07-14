import { getDateDaysAgo, getDateInputValue } from "@/src/lib/habits/queries";
import type {
  HabitCompletion,
  HabitDefinition,
  Workout,
} from "@/src/lib/supabase/database.types";
import { describe, expect, it } from "vitest";
import {
  calculateReadiness,
  calculateTrainingStreak,
  classifyWeeklyLoad,
} from "./readiness";

function workout(overrides: Partial<Workout>): Workout {
  return {
    workout_date: getDateInputValue(),
    duration_minutes: 60,
    ...overrides,
  } as Workout;
}

function habit(id: string, name: string): HabitDefinition {
  return { id, name, is_active: true } as HabitDefinition;
}

function completion(
  habitId: string,
  date: string,
  isCompleted: boolean
): HabitCompletion {
  return {
    habit_id: habitId,
    completed_date: date,
    is_completed: isCompleted,
  } as HabitCompletion;
}

const emptyReadinessInput = {
  workoutsLastSevenDays: [],
  recentHabits: [],
  habitDefinitions: [],
  recentHabitCompletions: [],
};

describe("classifyWeeklyLoad", () => {
  it("classifies an empty week as Light", () => {
    const load = classifyWeeklyLoad([]);

    expect(load.label).toBe("Light");
    expect(load.minutes).toBe(0);
    expect(load.sessions).toBe(0);
  });

  it("classifies a single short session as Building", () => {
    expect(classifyWeeklyLoad([workout({ duration_minutes: 45 })]).label).toBe(
      "Building"
    );
  });

  it("classifies 150+ minutes as Optimal", () => {
    expect(
      classifyWeeklyLoad([
        workout({ duration_minutes: 80 }),
        workout({ duration_minutes: 75 }),
      ]).label
    ).toBe("Optimal");
  });

  it("classifies 3 sessions as Optimal even with low minutes", () => {
    expect(
      classifyWeeklyLoad([
        workout({ duration_minutes: 20 }),
        workout({ duration_minutes: 20 }),
        workout({ duration_minutes: 20 }),
      ]).label
    ).toBe("Optimal");
  });

  it("classifies more than 360 minutes as High", () => {
    expect(
      classifyWeeklyLoad([
        workout({ duration_minutes: 200 }),
        workout({ duration_minutes: 200 }),
      ]).label
    ).toBe("High");
  });

  it("treats null durations as 0 minutes", () => {
    expect(classifyWeeklyLoad([workout({ duration_minutes: null })]).label).toBe(
      "Light"
    );
  });
});

describe("calculateTrainingStreak", () => {
  it("returns 0 with no activity", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [],
        habitDefinitions: [],
        habitCompletions: [],
      })
    ).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [getDateDaysAgo(0), getDateDaysAgo(1), getDateDaysAgo(2)],
        habitDefinitions: [],
        habitCompletions: [],
      })
    ).toBe(3);
  });

  it("keeps the streak alive when today is still pending", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [getDateDaysAgo(1), getDateDaysAgo(2)],
        habitDefinitions: [],
        habitCompletions: [],
      })
    ).toBe(2);
  });

  it("breaks the streak on a gap", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [getDateDaysAgo(0), getDateDaysAgo(2), getDateDaysAgo(3)],
        habitDefinitions: [],
        habitCompletions: [],
      })
    ).toBe(1);
  });

  it("counts completed 'Trained' habit days as active", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [getDateDaysAgo(0)],
        habitDefinitions: [habit("h1", "Trained today")],
        habitCompletions: [completion("h1", getDateDaysAgo(1), true)],
      })
    ).toBe(2);
  });

  it("ignores incomplete habit records", () => {
    expect(
      calculateTrainingStreak({
        workoutDates: [],
        habitDefinitions: [habit("h1", "Trained today")],
        habitCompletions: [completion("h1", getDateDaysAgo(0), false)],
      })
    ).toBe(0);
  });
});

describe("calculateReadiness", () => {
  it("lands on the neutral baseline with no data", () => {
    const readiness = calculateReadiness(emptyReadinessInput);

    // 72 recovery, 70 sleep, 40 consistency, 70 load with documented weights.
    expect(readiness.score).toBe(65);
    expect(readiness.state).toBe("steady");
    expect(readiness.components).toHaveLength(4);
  });

  it("keeps recovery reduced the day after a session", () => {
    const readiness = calculateReadiness({
      ...emptyReadinessInput,
      workoutsLastSevenDays: [
        workout({ workout_date: getDateDaysAgo(1), duration_minutes: 60 }),
      ],
    });
    const recovery = readiness.components.find(
      (component) => component.label === "Recovery"
    );

    expect(recovery?.score).toBe(64);
    expect(recovery?.detail).toContain("recovery still underway");
  });

  it("drops recovery hardest right after training", () => {
    const readiness = calculateReadiness({
      ...emptyReadinessInput,
      workoutsLastSevenDays: [
        workout({ workout_date: getDateDaysAgo(0), duration_minutes: 60 }),
      ],
    });
    const recovery = readiness.components.find(
      (component) => component.label === "Recovery"
    );

    expect(recovery?.score).toBe(45);
  });

  it("climbs back as rest days accumulate", () => {
    const recoveryAfter = (daysAgo: number) => {
      const readiness = calculateReadiness({
        ...emptyReadinessInput,
        workoutsLastSevenDays: [
          workout({
            workout_date: getDateDaysAgo(daysAgo),
            duration_minutes: 60,
          }),
        ],
      });
      return (
        readiness.components.find(
          (component) => component.label === "Recovery"
        )?.score ?? 0
      );
    };

    const curve = [0, 1, 2, 3].map(recoveryAfter);

    // Strictly increasing across the repair window.
    expect(curve[0]).toBeLessThan(curve[1]);
    expect(curve[1]).toBeLessThan(curve[2]);
    expect(curve[2]).toBeLessThan(curve[3]);
  });

  it("caps the total score after training even with perfect sleep", () => {
    const trainedToday = calculateReadiness({
      ...emptyReadinessInput,
      recentHabits: [
        { date: getDateDaysAgo(0), percentage: 100 } as never,
      ],
      workoutsLastSevenDays: [
        workout({ workout_date: getDateDaysAgo(0), duration_minutes: 60 }),
        workout({ workout_date: getDateDaysAgo(2), duration_minutes: 90 }),
        workout({ workout_date: getDateDaysAgo(4), duration_minutes: 90 }),
      ],
      healthToday: {
        metric_date: getDateDaysAgo(0),
        sleep_minutes: 480,
        resting_heart_rate_bpm: null,
      } as never,
    });

    expect(trainedToday.score).toBeLessThanOrEqual(62);

    const trainedYesterday = calculateReadiness({
      ...emptyReadinessInput,
      recentHabits: [
        { date: getDateDaysAgo(0), percentage: 100 } as never,
      ],
      workoutsLastSevenDays: [
        workout({ workout_date: getDateDaysAgo(1), duration_minutes: 60 }),
        workout({ workout_date: getDateDaysAgo(3), duration_minutes: 90 }),
        workout({ workout_date: getDateDaysAgo(5), duration_minutes: 90 }),
      ],
      healthToday: {
        metric_date: getDateDaysAgo(0),
        sleep_minutes: 480,
        resting_heart_rate_bpm: null,
      } as never,
    });

    expect(trainedYesterday.score).toBeLessThanOrEqual(72);
  });

  it("prefers synced sleep over the manual habit", () => {
    const readiness = calculateReadiness({
      ...emptyReadinessInput,
      healthToday: {
        metric_date: getDateDaysAgo(0),
        sleep_minutes: 460,
        resting_heart_rate_bpm: null,
      } as never,
    });
    const sleep = readiness.components.find(
      (component) => component.label === "Sleep"
    );

    expect(sleep?.score).toBe(96);
    expect(sleep?.detail).toContain("synced sleep");
  });

  it("penalizes a missed alcohol habit", () => {
    const withAlcoholHabit = calculateReadiness({
      ...emptyReadinessInput,
      habitDefinitions: [habit("h1", "No alcohol")],
      recentHabitCompletions: [completion("h1", getDateDaysAgo(1), false)],
    });
    const baseline = calculateReadiness(emptyReadinessInput);

    expect(withAlcoholHabit.score).toBe(baseline.score - 6);
  });

  it("always stays within 0-100", () => {
    const readiness = calculateReadiness(emptyReadinessInput);

    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
  });
});
