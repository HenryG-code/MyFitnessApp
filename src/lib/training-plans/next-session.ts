import type { TrainingPlan, TrainingSession } from "@/src/lib/training-plans/types";

type PlanWorkout = {
  title: string;
  notes: string | null;
};

export function getNextTrainingSession(
  plan: TrainingPlan,
  workouts: PlanWorkout[]
): TrainingSession {
  const marker = `suggested training plan: ${plan.title}`.toLowerCase();
  const latestPlanWorkout = workouts.find((workout) =>
    workout.notes?.toLowerCase().includes(marker)
  );

  if (!latestPlanWorkout) {
    return plan.days[0];
  }

  const latestIndex = plan.days.findIndex(
    (session) => session.title === latestPlanWorkout.title
  );

  if (latestIndex === -1) {
    return plan.days[0];
  }

  return plan.days[(latestIndex + 1) % plan.days.length];
}
