import { describe, expect, it } from "vitest";
import { buildAchievements } from "./achievements";

describe("buildAchievements", () => {
  it("unlocks the requested fitness achievements at their targets", () => {
    const achievements = buildAchievements({
      bestDailySteps: 10_000,
      perfectHabitDays: 7,
      weeklyWorkoutsCompleted: 3,
      weeklyWorkoutTarget: 3,
      streakDays: 7,
    });

    expect(achievements).toHaveLength(4);
    expect(achievements.every((achievement) => achievement.unlocked)).toBe(true);
    expect(achievements.every((achievement) => achievement.progress === 100)).toBe(
      true
    );
  });

  it("keeps future health achievements safely locked without synced data", () => {
    const achievements = buildAchievements({
      bestDailySteps: 0,
      perfectHabitDays: 2,
      weeklyWorkoutsCompleted: 1,
      weeklyWorkoutTarget: 3,
      streakDays: 1,
    });

    expect(achievements.find((achievement) => achievement.id === "ten-k-day"))
      .toMatchObject({ unlocked: false, progress: 0 });
  });
});
