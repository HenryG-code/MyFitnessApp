import type {
  RunningExperience,
  RunningPlanState,
  RunningSession,
  RunningSessionCompletion,
  RunningSessionKind,
  RunningWeek,
} from "@/src/lib/running-plans/types";

const startingDistances: Record<RunningExperience, number> = {
  starting: 0.8,
  building: 2,
  regular: 4.5,
};

function roundDistance(value: number) {
  return Math.round(value * 10) / 10;
}

function clampGoal(value: number) {
  return Math.min(42, Math.max(2, roundDistance(value)));
}

export function getPlanLength(goalKm: number, experience: RunningExperience) {
  const start = Math.min(startingDistances[experience], goalKm * 0.72);
  return Math.min(14, Math.max(4, Math.ceil((goalKm - start) / 0.75) + 1));
}

function getWeekTarget(
  goalKm: number,
  experience: RunningExperience,
  week: number
) {
  const totalWeeks = getPlanLength(goalKm, experience);
  const start = Math.min(startingDistances[experience], goalKm * 0.72);
  const progress = totalWeeks === 1 ? 1 : (week - 1) / (totalWeeks - 1);
  const easedProgress = 1 - Math.pow(1 - progress, 1.08);
  return roundDistance(start + (goalKm - start) * easedProgress);
}

function getMilestone(target: number, previousTarget: number, goal: number) {
  const milestones = [3, 5, 10, goal]
    .filter((value, index, values) => value <= goal && values.indexOf(value) === index)
    .sort((a, b) => a - b);

  return milestones.find(
    (milestone) => milestone > previousTarget && milestone <= target
  ) ?? null;
}

function buildSession(
  id: RunningSessionKind,
  targetDistanceKm: number
): RunningSession {
  if (id === "easy") {
    const distanceKm = roundDistance(Math.max(0.8, targetDistanceKm * 0.62));
    return {
      id,
      title: "Easy foundations",
      description: "Relaxed run or run-walk. You should be able to speak in full sentences.",
      distanceKm,
      suggestedMinutes: Math.max(12, Math.round(distanceKm * 8)),
      cue: "Keep it conversational",
    };
  }

  if (id === "intervals") {
    const distanceKm = roundDistance(Math.max(1, targetDistanceKm * 0.52));
    return {
      id,
      title: "Controlled intervals",
      description: "Alternate 2 minutes steady with 1 minute easy. Stay smooth, not all-out.",
      distanceKm,
      suggestedMinutes: Math.max(15, Math.round(distanceKm * 7.5)),
      cue: "Finish with energy left",
    };
  }

  return {
    id,
    title: "Distance builder",
    description: "Your longest easy effort of the week. Walking breaks are part of the plan.",
    distanceKm: targetDistanceKm,
    suggestedMinutes: Math.max(18, Math.round(targetDistanceKm * 8)),
    cue: "Distance matters more than pace",
  };
}

export function createRunningPlanState(
  goalKm: number,
  experience: RunningExperience
): RunningPlanState {
  return {
    version: 1,
    goalKm: clampGoal(goalKm),
    experience,
    currentWeek: 1,
    weekAttempt: 1,
    completedSessions: [],
    effortBySession: {},
    distanceBySession: {},
    status: "active",
    startedAt: new Date().toISOString(),
    completedAt: null,
    totalRuns: 0,
    distanceModifier: 1,
    adaptationMessage: "Your first week starts gently so your body can adapt.",
  };
}

export function getRunningWeek(state: RunningPlanState): RunningWeek {
  const totalWeeks = getPlanLength(state.goalKm, state.experience);
  const baseTarget = getWeekTarget(
    state.goalKm,
    state.experience,
    state.currentWeek
  );
  const targetDistanceKm = roundDistance(baseTarget * state.distanceModifier);
  const previousTarget =
    state.currentWeek === 1
      ? 0
      : getWeekTarget(state.goalKm, state.experience, state.currentWeek - 1);

  return {
    week: state.currentWeek,
    totalWeeks,
    targetDistanceKm,
    milestoneKm: getMilestone(targetDistanceKm, previousTarget, state.goalKm),
    sessions: (["easy", "intervals", "long"] as RunningSessionKind[]).map(
      (kind) => buildSession(kind, targetDistanceKm)
    ),
  };
}

export function completeRunningSession(
  state: RunningPlanState,
  completion: RunningSessionCompletion
): RunningPlanState {
  if (
    state.status === "completed" ||
    state.completedSessions.includes(completion.session.id)
  ) {
    return state;
  }

  const completedSessions = [...state.completedSessions, completion.session.id];
  const effortBySession = {
    ...state.effortBySession,
    [completion.session.id]: completion.effort,
  };
  const distanceBySession = {
    ...state.distanceBySession,
    [completion.session.id]: completion.actualDistanceKm,
  };
  const baseState: RunningPlanState = {
    ...state,
    completedSessions,
    effortBySession,
    distanceBySession,
    totalRuns: state.totalRuns + 1,
    adaptationMessage: "Run saved. Your coach will adjust after all three sessions.",
  };

  if (completedSessions.length < 3) {
    return baseState;
  }

  const tooHardCount = Object.values(effortBySession).filter(
    (effort) => effort === "too-hard"
  ).length;
  const week = getRunningWeek(state);
  const reachedGoal =
    state.currentWeek >= week.totalWeeks &&
    (distanceBySession.long ?? 0) >= state.goalKm * 0.95;

  if (reachedGoal && tooHardCount < 2) {
    return {
      ...baseState,
      status: "completed",
      completedAt: new Date().toISOString(),
      adaptationMessage: `Goal reached — you built up to ${state.goalKm} km.`,
    };
  }

  if (tooHardCount >= 2) {
    return {
      ...baseState,
      weekAttempt: state.weekAttempt + 1,
      completedSessions: [],
      effortBySession: {},
      distanceBySession: {},
      distanceModifier: Math.max(0.82, roundDistance(state.distanceModifier - 0.1)),
      adaptationMessage:
        "This week felt demanding, so the coach reduced the distance and kept you here for another attempt.",
    };
  }

  if (state.currentWeek >= week.totalWeeks) {
    return {
      ...baseState,
      weekAttempt: state.weekAttempt + 1,
      completedSessions: [],
      effortBySession: {},
      distanceBySession: {},
      distanceModifier: 1,
      adaptationMessage:
        "You are close. Repeat the goal week and complete the distance builder to finish.",
    };
  }

  return {
    ...baseState,
    currentWeek: state.currentWeek + 1,
    weekAttempt: 1,
    completedSessions: [],
    effortBySession: {},
    distanceBySession: {},
    distanceModifier: 1,
    adaptationMessage:
      tooHardCount === 1
        ? "Week complete. The next increase is intentionally small to keep progress sustainable."
        : "Strong week. Your next distance step is ready.",
  };
}
