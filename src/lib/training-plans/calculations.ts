import type {
  SessionType,
  TrainingPlan,
  TrainingPlanSummary,
} from "@/src/lib/training-plans/types";

const strengthSessionTypes: SessionType[] = ["Strength", "Hybrid"];
const cardioSessionTypes: SessionType[] = ["Cardio", "Hybrid"];
const mobilitySessionTypes: SessionType[] = ["Mobility", "Yoga", "Recovery"];

export function calculateTrainingPlanSummary(
  plan: TrainingPlan
): TrainingPlanSummary {
  return {
    sessions: plan.days.length,
    weeklyMinutes: plan.days.reduce(
      (total, session) => total + session.durationMinutes,
      0
    ),
    strengthSessions: plan.days.filter((session) =>
      strengthSessionTypes.includes(session.sessionType)
    ).length,
    cardioSessions: plan.days.filter((session) =>
      cardioSessionTypes.includes(session.sessionType)
    ).length,
    mobilityRecoverySessions: plan.days.filter((session) =>
      mobilitySessionTypes.includes(session.sessionType)
    ).length,
  };
}

export function canLogSession(sessionType: SessionType) {
  return sessionType === "Strength" || sessionType === "Hybrid";
}
