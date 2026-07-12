import { describe, expect, it } from "vitest";
import { calculateBestStreak } from "./journey";

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
