import { describe, expect, it } from "vitest";
import {
  getDateInTimeZone,
  getDaysBetweenDates,
  getInactivityMotivation,
} from "./motivation";

describe("getDaysBetweenDates", () => {
  it("returns 0 for the same day", () => {
    expect(getDaysBetweenDates("2026-07-12", "2026-07-12")).toBe(0);
  });

  it("counts whole days forward", () => {
    expect(getDaysBetweenDates("2026-07-01", "2026-07-12")).toBe(11);
  });

  it("crosses month boundaries", () => {
    expect(getDaysBetweenDates("2026-06-28", "2026-07-02")).toBe(4);
  });

  it("crosses year boundaries", () => {
    expect(getDaysBetweenDates("2025-12-30", "2026-01-02")).toBe(3);
  });

  it("clamps reversed ranges to 0", () => {
    expect(getDaysBetweenDates("2026-07-12", "2026-07-01")).toBe(0);
  });

  it("returns 0 for unparseable dates", () => {
    expect(getDaysBetweenDates("not-a-date", "2026-07-12")).toBe(0);
    expect(getDaysBetweenDates("2026-07-12", "")).toBe(0);
  });
});

describe("getDateInTimeZone", () => {
  const instant = new Date("2026-07-12T01:30:00Z");

  it("formats the date for a timezone behind UTC", () => {
    expect(getDateInTimeZone(instant, "America/Los_Angeles")).toBe(
      "2026-07-11"
    );
  });

  it("formats the date for a timezone ahead of UTC", () => {
    expect(getDateInTimeZone(instant, "Asia/Tokyo")).toBe("2026-07-12");
  });

  it("formats UTC explicitly", () => {
    expect(getDateInTimeZone(instant, "UTC")).toBe("2026-07-12");
  });

  it("falls back to UTC instead of throwing on an invalid timezone", () => {
    expect(getDateInTimeZone(instant, "Not/A_Zone")).toBe("2026-07-12");
  });
});

describe("getInactivityMotivation", () => {
  it("uses the gentle tier below 7 days and points to a live workout", () => {
    const motivation = getInactivityMotivation(3, "user-a");

    expect(motivation.title).toBe("Keep your rhythm alive");
    expect(motivation.url).toBe("/workouts/live");
  });

  it("uses the reset tier from 7 to 13 days and points to the plan", () => {
    for (const days of [7, 10, 13]) {
      const motivation = getInactivityMotivation(days, "user-a");

      expect(motivation.title).toBe("Ready for a reset?");
      expect(motivation.url).toBe("/training-plan");
    }
  });

  it("uses the comeback tier from 14 days", () => {
    const motivation = getInactivityMotivation(14, "user-a");

    expect(motivation.title).toBe("Your comeback can start small");
    expect(motivation.url).toBe("/workouts/live");
  });

  it("is deterministic for the same seed and day count", () => {
    expect(getInactivityMotivation(9, "user-2026-07-12")).toEqual(
      getInactivityMotivation(9, "user-2026-07-12")
    );
  });

  it("always returns a non-empty body", () => {
    for (const days of [0, 1, 6, 7, 13, 14, 60]) {
      expect(getInactivityMotivation(days, "seed").body).not.toBe("");
    }
  });
});
