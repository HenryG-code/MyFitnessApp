import { describe, expect, it } from "vitest";
import { getWeeklyCoachMessage } from "./motivation";

describe("getWeeklyCoachMessage", () => {
  it("stays stable throughout the same Monday-Sunday week", () => {
    expect(
      getWeeklyCoachMessage(new Date("2026-07-13T09:00:00Z"), "Henry")
    ).toBe(
      getWeeklyCoachMessage(new Date("2026-07-19T21:00:00Z"), "Henry")
    );
  });

  it("rotates when the week changes", () => {
    expect(
      getWeeklyCoachMessage(new Date("2026-07-19T21:00:00Z"), "Henry")
    ).not.toBe(
      getWeeklyCoachMessage(new Date("2026-07-20T09:00:00Z"), "Henry")
    );
  });
});
