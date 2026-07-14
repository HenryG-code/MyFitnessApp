import type { DatedExercise } from "@/src/lib/performance/muscles";
import { describe, expect, it } from "vitest";
import {
  buildStrengthTrends,
  calculateBestStreak,
  estimateTrackedOneRepMax,
  isOneRepMaxLift,
  suggestNextOneRepMax,
} from "./journey";

function exercise(
  name: string,
  weight: number | null,
  reps: number,
  date = "2026-07-10"
): DatedExercise {
  return {
    exercise_name: name,
    weight,
    reps,
    workout_date: date,
  } as DatedExercise;
}

describe("isOneRepMaxLift", () => {
  it("accepts canonical heavy barbell lifts and their safe aliases", () => {
    for (const name of [
      "Bench press",
      "Barbell Bench Press",
      "Back squat",
      "Low Bar Back Squat",
      "Deadlift",
      "Sumo Deadlift",
      "Overhead Press",
      "Strict press",
    ]) {
      expect(isOneRepMaxLift(name)).toBe(true);
    }
  });

  it("rejects Romanian deadlifts, secondary variants, and accessory work", () => {
    for (const name of [
      "Romanian deadlift",
      "RDL",
      "Stiff-leg deadlift",
      "Incline Bench Press",
      "Dumbbell Bench Press",
      "Front Squat",
      "Weighted Pull-Up",
      "Bicep curl",
      "Lateral raise",
      "Lat pulldown",
      "Barbell row",
      "Leg press",
      "Leg press or goblet squat",
      "Goblet squat",
      "Bulgarian split squat",
      "Plank",
    ]) {
      expect(isOneRepMaxLift(name)).toBe(false);
    }
  });
});

describe("suggestNextOneRepMax", () => {
  it("projects 80 kg for five reps to an 85 kg one-rep max", () => {
    expect(suggestNextOneRepMax({ workingWeight: 80, reps: 5 })).toBe(85);
  });

  it("treats a completed single as the current one-rep max", () => {
    expect(suggestNextOneRepMax({ workingWeight: 80, reps: 1 })).toBe(80);
  });

  it("preserves practical half-kilo loading increments", () => {
    expect(suggestNextOneRepMax({ workingWeight: 82.5, reps: 5 })).toBe(87.5);
  });

  it("returns null without a usable weight and rep count", () => {
    expect(estimateTrackedOneRepMax(null, 5)).toBeNull();
    expect(estimateTrackedOneRepMax(80, null)).toBeNull();
    expect(suggestNextOneRepMax({ workingWeight: 0, reps: 5 })).toBeNull();
    expect(suggestNextOneRepMax({ workingWeight: 80, reps: 0 })).toBeNull();
  });
});

describe("buildStrengthTrends", () => {
  it("tracks only one-rep-max lifts", () => {
    const trends = buildStrengthTrends([
      exercise("Bench press", 80, 5, "2026-07-01"),
      exercise("Bench press", 85, 5, "2026-07-08"),
      exercise("Bicep curl", 16, 10, "2026-07-01"),
      exercise("Lat pulldown", 60, 8, "2026-07-01"),
      exercise("Romanian deadlift", 100, 5, "2026-07-02"),
      exercise("Overhead press", 45, 5, "2026-07-02"),
    ]);
    const names = trends.map((trend) => trend.exerciseName);

    expect(names).toContain("Bench Press");
    expect(names).toContain("Overhead Press");
    expect(names).not.toContain("Romanian deadlift");
    expect(names).not.toContain("Bicep curl");
    expect(names).not.toContain("Lat pulldown");
  });

  it("still computes the estimated 1RM progression", () => {
    const trends = buildStrengthTrends([
      exercise("Squat", 100, 5, "2026-06-01"),
      exercise("Squat", 110, 5, "2026-07-01"),
    ]);

    expect(trends).toHaveLength(1);
    expect(trends[0].sessions).toBe(2);
    expect(trends[0].lastOneRepMax).toBeGreaterThan(
      trends[0].firstOneRepMax
    );
  });

  it("merges bench aliases into one canonical trend", () => {
    const trends = buildStrengthTrends([
      exercise("Bench press", 80, 5, "2026-07-01"),
      exercise("Bench Press", 82.5, 5, "2026-07-04"),
      exercise("Barbell bench press", 85, 5, "2026-07-08"),
    ]);

    expect(trends).toHaveLength(1);
    expect(trends[0]).toMatchObject({
      liftId: "bench-press",
      exerciseName: "Bench Press",
      sessions: 3,
    });
  });
});

describe("calculateBestStreak", () => {
  it("returns 0 for no active days", () => {
    expect(calculateBestStreak([])).toBe(0);
  });

  it("returns 1 for a single day", () => {
    expect(calculateBestStreak(["2026-07-12"])).toBe(1);
  });

  it("counts consecutive days", () => {
    expect(
      calculateBestStreak(["2026-07-10", "2026-07-11", "2026-07-12"])
    ).toBe(3);
  });

  it("picks the longest run across gaps", () => {
    expect(
      calculateBestStreak([
        "2026-07-01",
        "2026-07-02",
        "2026-07-05",
        "2026-07-06",
        "2026-07-07",
        "2026-07-10",
      ])
    ).toBe(3);
  });

  it("handles unsorted input with duplicates", () => {
    expect(
      calculateBestStreak([
        "2026-07-12",
        "2026-07-10",
        "2026-07-11",
        "2026-07-11",
      ])
    ).toBe(3);
  });

  it("counts runs across month boundaries", () => {
    expect(
      calculateBestStreak(["2026-06-29", "2026-06-30", "2026-07-01"])
    ).toBe(3);
  });
});
