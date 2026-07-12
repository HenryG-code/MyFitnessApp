import { getDateDaysAgo } from "@/src/lib/habits/queries";
import type { WeightLog, Workout } from "@/src/lib/supabase/database.types";
import { describe, expect, it } from "vitest";
import { buildWeeklyReport } from "./report";

function workout(daysAgo: number, minutes: number): Workout {
  return {
    workout_date: getDateDaysAgo(daysAgo),
    duration_minutes: minutes,
  } as Workout;
}

function weightLog(daysAgo: number, weightKg: number): WeightLog {
  return {
    logged_at: getDateDaysAgo(daysAgo),
    weight_kg: weightKg,
  } as WeightLog;
}

function findDelta(report: ReturnType<typeof buildWeeklyReport>, label: string) {
  const delta = report.deltas.find((item) => item.label === label);

  if (!delta) {
    throw new Error(`Missing delta: ${label}`);
  }

  return delta;
}

const emptyInput = {
  workouts: [],
  weights: [],
  habitDays: [],
  exercises: [],
};

describe("buildWeeklyReport", () => {
  it("produces an empty-week report without crashing", () => {
    const report = buildWeeklyReport(emptyInput);

    expect(report.daysActive).toBe(0);
    expect(report.narrative[0]).toBe("No sessions were logged this week.");
    expect(findDelta(report, "Workouts").current).toBe("0");
  });

  it("counts distinct active days this week", () => {
    const report = buildWeeklyReport({
      ...emptyInput,
      workouts: [workout(0, 45), workout(0, 30), workout(2, 60)],
    });

    expect(report.daysActive).toBe(2);
    expect(findDelta(report, "Workouts").current).toBe("3");
  });

  it("compares this week against last week", () => {
    const report = buildWeeklyReport({
      ...emptyInput,
      // One session this week, three last week (7-13 days ago).
      workouts: [workout(1, 40), workout(8, 40), workout(9, 40), workout(10, 40)],
    });
    const workouts = findDelta(report, "Workouts");

    expect(workouts.change).toBe("-2 vs last week");
    expect(workouts.direction).toBe("down");
  });

  it("reports weight change against the pre-week baseline", () => {
    const report = buildWeeklyReport({
      ...emptyInput,
      weights: [weightLog(10, 84.0), weightLog(1, 83.2)],
    });
    const weight = findDelta(report, "Weight");

    expect(weight.current).toBe("83.2 kg");
    expect(weight.change).toBe("-0.8 kg");
    expect(weight.direction).toBe("down");
    expect(weight.positive).toBe(true);
  });

  it("omits synced-health deltas when no health data exists", () => {
    const report = buildWeeklyReport(emptyInput);
    const labels = report.deltas.map((delta) => delta.label);

    expect(labels).not.toContain("Steps");
    expect(labels).not.toContain("Avg sleep");
  });
});
