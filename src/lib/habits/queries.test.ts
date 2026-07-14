import { describe, expect, it } from "vitest";
import { findActiveTrainedHabit } from "./queries";

function candidate(
  id: string,
  name: string,
  options: { active?: boolean; isDefault?: boolean } = {}
) {
  return {
    id,
    name,
    is_active: options.active ?? true,
    is_default: options.isDefault ?? false,
  };
}

describe("findActiveTrainedHabit", () => {
  it("matches the active Trained habit with normalized casing and spacing", () => {
    expect(
      findActiveTrainedHabit([candidate("trained", "  TRAINED  ")])?.id
    ).toBe("trained");
  });

  it("prefers the default definition when duplicate data exists", () => {
    const match = findActiveTrainedHabit([
      candidate("custom", "Trained"),
      candidate("default", "Trained", { isDefault: true }),
    ]);

    expect(match?.id).toBe("default");
  });

  it("ignores hidden habits and similar but non-matching names", () => {
    expect(
      findActiveTrainedHabit([
        candidate("hidden", "Trained", { active: false, isDefault: true }),
        candidate("legs", "Trained legs"),
      ])
    ).toBeNull();
  });
});
