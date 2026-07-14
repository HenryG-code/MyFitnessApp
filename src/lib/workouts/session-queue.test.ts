import { describe, expect, it } from "vitest";
import { selectRepresentativeLoggedSet } from "./session-queue";

describe("selectRepresentativeLoggedSet", () => {
  it("keeps weight and reps from the same logged set", () => {
    const sets = [
      { weight: 100, reps: 5 },
      { weight: 110, reps: 2 },
      { weight: 105, reps: 6 },
    ];

    expect(selectRepresentativeLoggedSet(sets)).toEqual({
      weight: 110,
      reps: 2,
    });
  });

  it("uses weight, then reps, when no better estimated max exists", () => {
    expect(
      selectRepresentativeLoggedSet([
        { weight: 80, reps: null },
        { weight: 85, reps: null },
      ])
    ).toEqual({ weight: 85, reps: null });

    expect(
      selectRepresentativeLoggedSet([
        { weight: 100, reps: null },
        { weight: 100, reps: 1 },
      ])
    ).toEqual({ weight: 100, reps: 1 });
  });

  it("preserves a bodyweight set and handles an empty log", () => {
    expect(
      selectRepresentativeLoggedSet([
        { weight: null, reps: 8 },
        { weight: null, reps: 10 },
      ])
    ).toEqual({ weight: null, reps: 10 });
    expect(selectRepresentativeLoggedSet([])).toBeNull();
  });
});
