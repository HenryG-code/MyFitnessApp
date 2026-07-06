import {
  defaultTrainingGoal,
  getTrainingPlanByGoal,
} from "@/src/lib/training-plans/data";
import { loadTrainingGoalFromStorage } from "@/src/lib/training-plans/storage";
import type {
  TrainingGoal,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import type { Workout } from "@/src/lib/supabase/database.types";

export type TodayMission = {
  goal: TrainingGoal;
  session: TrainingSession;
  sessionIndex: number;
  totalSessions: number;
  completedThisWeek: number;
  alreadyTrainedToday: boolean;
};

/**
 * Picks the next uncompleted plan session for the selected goal, based on how
 * many sessions were logged this week.
 */
export function buildTodayMission(input: {
  selectedGoal: TrainingGoal | null;
  workoutsThisWeek: Workout[];
  todayDate: string;
}): TodayMission {
  const goal =
    input.selectedGoal ?? loadTrainingGoalFromStorage() ?? defaultTrainingGoal;
  const plan = getTrainingPlanByGoal(goal);
  const completed = input.workoutsThisWeek.length;
  const sessionIndex = Math.min(completed, plan.days.length - 1);

  return {
    goal,
    session: plan.days[sessionIndex],
    sessionIndex,
    totalSessions: plan.days.length,
    completedThisWeek: completed,
    alreadyTrainedToday: input.workoutsThisWeek.some(
      (workout) => workout.workout_date === input.todayDate
    ),
  };
}
