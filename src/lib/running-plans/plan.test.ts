import { describe, expect, it } from "vitest";
import {
  completeRunningSession,
  createRunningPlanState,
  getRunningWeek,
} from "@/src/lib/running-plans/plan";
import type {
  RunningEffort,
  RunningPlanState,
  RunningSession,
} from "@/src/lib/running-plans/types";

function complete(
  state: RunningPlanState,
  session: RunningSession,
  effort: RunningEffort = "comfortable",
  distance = session.distanceKm
) {
  return completeRunningSession(state, {
    session,
    effort,
    actualDistanceKm: distance,
    durationMinutes: session.suggestedMinutes,
  });
}

describe("adaptive running plan", () => {
  it("builds a gradual plan that ends at the selected distance", () => {
    const state = createRunningPlanState(10, "starting");
    const firstWeek = getRunningWeek(state);
    const finalWeek = getRunningWeek({
      ...state,
      currentWeek: firstWeek.totalWeeks,
    });

    expect(firstWeek.targetDistanceKm).toBeLessThan(3);
    expect(finalWeek.targetDistanceKm).toBe(10);
    expect(finalWeek.sessions).toHaveLength(3);
  });

  it("advances after three manageable runs", () => {
    let state = createRunningPlanState(5, "starting");
    const week = getRunningWeek(state);

    for (const session of week.sessions) {
      state = complete(state, session);
    }

    expect(state.currentWeek).toBe(2);
    expect(state.completedSessions).toEqual([]);
    expect(state.adaptationMessage).toContain("next distance step");
  });

  it("repeats the week at a reduced load when two runs feel too hard", () => {
    let state = createRunningPlanState(5, "starting");
    const week = getRunningWeek(state);

    state = complete(state, week.sessions[0], "too-hard");
    state = complete(state, week.sessions[1], "too-hard");
    state = complete(state, week.sessions[2], "challenging");

    expect(state.currentWeek).toBe(1);
    expect(state.weekAttempt).toBe(2);
    expect(state.distanceModifier).toBeLessThan(1);
    expect(state.completedSessions).toEqual([]);
  });

  it("finishes when the final long run is reached in any session order", () => {
    let state = createRunningPlanState(3, "starting");
    const planLength = getRunningWeek(state).totalWeeks;
    state = { ...state, currentWeek: planLength };
    const week = getRunningWeek(state);
    const longRun = week.sessions.find((session) => session.id === "long")!;
    const otherRuns = week.sessions.filter((session) => session.id !== "long");

    state = complete(state, longRun, "challenging", 3);
    state = complete(state, otherRuns[0]);
    state = complete(state, otherRuns[1]);

    expect(state.status).toBe("completed");
    expect(state.completedAt).not.toBeNull();
  });
});
