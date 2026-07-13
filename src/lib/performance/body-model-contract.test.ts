import { describe, expect, it } from "vitest";
import {
  bodyRegionInstances,
  bodyRegionParts,
  getBodyRegionAtPoint,
} from "@/src/lib/performance/body-model-contract";
import { muscleGroupNames } from "@/src/lib/performance/muscles";

describe("body model contract", () => {
  it("covers every muscle group tracked by Body Intelligence", () => {
    expect(new Set(Object.keys(bodyRegionParts))).toEqual(
      new Set(Object.keys(muscleGroupNames)),
    );
  });

  it("maps mirrored arm regions to the same muscle group", () => {
    expect(getBodyRegionAtPoint(0.285, 1.3, 0.035).id).toBe("biceps");
    expect(getBodyRegionAtPoint(-0.285, 1.3, 0.035).id).toBe("biceps");
  });

  it("keeps front and rear torso regions distinct", () => {
    expect(getBodyRegionAtPoint(0.08, 1.355, 0.11).id).toBe("chest");
    expect(getBodyRegionAtPoint(0.095, 1.33, -0.1).id).toBe("back");
  });

  it("keeps every interaction volume inside the bundled model bounds", () => {
    for (const region of bodyRegionInstances) {
      expect(Math.abs(region.position[0])).toBeLessThanOrEqual(0.46);
      expect(region.position[1]).toBeGreaterThanOrEqual(0);
      expect(region.position[1]).toBeLessThanOrEqual(1.8);
      expect(Math.abs(region.position[2])).toBeLessThanOrEqual(0.17);
    }
  });
});
