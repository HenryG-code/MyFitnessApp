import { describe, expect, it } from "vitest";
import { getTrainingPlanByGoal } from "@/src/lib/training-plans/data";
import { getNextTrainingSession } from "@/src/lib/training-plans/next-session";

describe("next suggested training session", () => {
  const plan = getTrainingPlanByGoal("Get fit", "Beginner");

  it("starts with day one when the plan has no history", () => {
    expect(getNextTrainingSession(plan, []).dayLabel).toBe("Day 1");
  });

  it("moves to the session after the latest logged plan workout", () => {
    const first = plan.days[0];
    const next = getNextTrainingSession(plan, [
      {
        title: first.title,
        notes: `Logged from suggested training plan: ${plan.title} / ${first.title}.`,
      },
    ]);

    expect(next).toBe(plan.days[1]);
  });

  it("wraps back to day one after the last session", () => {
    const last = plan.days.at(-1)!;
    const next = getNextTrainingSession(plan, [
      {
        title: last.title,
        notes: `Logged from suggested training plan: ${plan.title} / ${last.title}.`,
      },
    ]);

    expect(next).toBe(plan.days[0]);
  });

  it("ignores workout history belonging to another plan", () => {
    expect(
      getNextTrainingSession(plan, [
        {
          title: plan.days[1].title,
          notes: "Logged from suggested training plan: Another plan / Session.",
        },
      ])
    ).toBe(plan.days[0]);
  });
});
