export type AchievementIcon = "steps" | "habits" | "workouts" | "streak";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  unlocked: boolean;
  progress: number;
  progressLabel: string;
};

function percentage(value: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}

export function buildAchievements(input: {
  bestDailySteps: number;
  perfectHabitDays: number;
  weeklyWorkoutsCompleted: number;
  weeklyWorkoutTarget: number;
  streakDays: number;
}): Achievement[] {
  const workoutTarget = Math.max(1, input.weeklyWorkoutTarget);

  return [
    {
      id: "ten-k-day",
      title: "10K Day",
      description: "Reach 10,000 steps in a single day.",
      icon: "steps",
      unlocked: input.bestDailySteps >= 10_000,
      progress: percentage(input.bestDailySteps, 10_000),
      progressLabel: `${Math.min(input.bestDailySteps, 10_000).toLocaleString("en")} / 10,000`,
    },
    {
      id: "perfect-habit-week",
      title: "Perfect Seven",
      description: "Complete every active habit for seven days.",
      icon: "habits",
      unlocked: input.perfectHabitDays >= 7,
      progress: percentage(input.perfectHabitDays, 7),
      progressLabel: `${Math.min(input.perfectHabitDays, 7)} / 7 days`,
    },
    {
      id: "weekly-plan-complete",
      title: "Plan Complete",
      description: "Finish every planned workout this week.",
      icon: "workouts",
      unlocked:
        input.weeklyWorkoutTarget > 0 &&
        input.weeklyWorkoutsCompleted >= input.weeklyWorkoutTarget,
      progress: percentage(input.weeklyWorkoutsCompleted, workoutTarget),
      progressLabel: `${Math.min(input.weeklyWorkoutsCompleted, workoutTarget)} / ${workoutTarget} sessions`,
    },
    {
      id: "seven-day-streak",
      title: "On a Roll",
      description: "Build a seven-day active streak.",
      icon: "streak",
      unlocked: input.streakDays >= 7,
      progress: percentage(input.streakDays, 7),
      progressLabel: `${Math.min(input.streakDays, 7)} / 7 days`,
    },
  ];
}
