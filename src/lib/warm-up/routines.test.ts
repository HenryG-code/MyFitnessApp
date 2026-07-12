import { describe, expect, it } from "vitest";
import {
  getWarmUpDuration,
  isGuidedWarmUpHabit,
  warmUpRoutines,
} from "@/src/lib/warm-up/routines";

describe("guided warm-up routines", () => {
  it("provides exactly ten minutes for both training modes", () => {
    expect(getWarmUpDuration(warmUpRoutines.run)).toBe(600);
    expect(getWarmUpDuration(warmUpRoutines.gym)).toBe(600);
  });

  it("recognizes common names for the linked stretch habit", () => {
    expect(isGuidedWarmUpHabit("Stretch for 10 mins")).toBe(true);
    expect(isGuidedWarmUpHabit("Stretch for 10minutes")).toBe(true);
    expect(isGuidedWarmUpHabit("Ten minute stretch")).toBe(false);
    expect(isGuidedWarmUpHabit("Stretch calves")).toBe(false);
  });
});
