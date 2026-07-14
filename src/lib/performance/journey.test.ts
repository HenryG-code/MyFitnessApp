import type { DatedExercise } from "@/src/lib/performance/muscles";
import { describe, expect, it } from "vitest";
import {
  buildStrengthTrends,
  calculateBestStreak,
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
  it("accepts the bench, squat, and deadlift families", () => {
    for (const name of [
      "Bench press",
      "Incline Bench Press",
      "Back squat",
      "Front Squat",
      "Deadlift",
      "Romanian deadlift",
    ]) {
      expect(isOneRepMaxLift(name)).toBe(true);
    }
  });

  it("accepts pull-up and chin-up variants", () => {
    for (const name of [
      "Pull ups",
      "Weighted Pull-Up",
      "Chin up",
      "Chin-ups",
    ]) {
      expect(isOneRepMaxLift(name)).toBe(true);
    }
  });

  it("rejects accessory and machine work", () => {
    for (const name of [
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
  it("caps the suggestion at one plate step above the current max", () => {
    // 80 kg × 5 gives an Epley estimate of ~93 kg — far too big a jump.
    expect(
      suggestNextOneRepMax({
        estimate: 93.3,
        currentMax: 80,
        workingWeight: 80,
      })
    ).toBe(82.5);
  });

  it("uses the working weight as reference when there is no history", () => {
    expect(
      suggestNextOneRepMax({
        estimate: 93.3,
        currentMax: null,
        workingWeight: 80,
      })
    ).toBe(82.5);
  });

  it("keeps light-set estimates below the current max untouched", () => {
    expect(
      suggestNextOneRepMax({
        estimate: 70,
        currentMax: 100,
        workingWeight: 60,
      })
    ).toBe(70);
  });

  it("never suggests less than the weight already lifted", () => {
    expect(
      suggestNextOneRepMax({
        estimate: 103.3,
        currentMax: 90,
        workingWeight: 100,
      })
    ).toBe(100);
  });

  it("returns null without a usable estimate or weight", () => {
    expect(
      suggestNextOneRepMax({ estimate: null, currentMax: 80, workingWeight: 80 })
    ).toBeNull();
    expect(
      suggestNextOneRepMax({ estimate: 93, currentMax: 80, workingWeight: 0 })
    ).toBeNull();
  });
});

describe("buildStrengthTrends", () => {
  it("tracks only one-rep-max lifts", () => {
    const trends = buildStrengthTrends([
      exercise("Bench press", 80, 5, "2026-07-01"),
      exercise("Bench press", 85, 5, "2026-07-08"),
      exercise("Bicep curl", 16, 10, "2026-07-01"),
      exercise("Lat pulldown", 60, 8, "2026-07-01"),
      exercise("Weighted pull-up", 20, 5, "2026-07-02"),
    ]);
    const names = trends.map((trend) => trend.exerciseName);

    expect(names).toContain("Bench press");
    expect(names).toContain("Weighted pull-up");
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

  it("skips bodyweight rows without a logged load", () => {
    expect(buildStrengthTrends([exercise("Pull ups", null, 8)])).toHaveLength(
      0
    );
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
