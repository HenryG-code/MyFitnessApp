export type RunningExperience = "starting" | "building" | "regular";

export type RunningEffort = "comfortable" | "challenging" | "too-hard";

export type RunningSessionKind = "easy" | "intervals" | "long";

export type RunningSession = {
  id: RunningSessionKind;
  title: string;
  description: string;
  distanceKm: number;
  suggestedMinutes: number;
  cue: string;
};

export type RunningWeek = {
  week: number;
  totalWeeks: number;
  targetDistanceKm: number;
  milestoneKm: number | null;
  sessions: RunningSession[];
};

export type RunningPlanStatus = "active" | "completed";

export type RunningPlanState = {
  version: 1;
  goalKm: number;
  experience: RunningExperience;
  currentWeek: number;
  weekAttempt: number;
  completedSessions: RunningSessionKind[];
  effortBySession: Partial<Record<RunningSessionKind, RunningEffort>>;
  distanceBySession: Partial<Record<RunningSessionKind, number>>;
  status: RunningPlanStatus;
  startedAt: string;
  completedAt: string | null;
  totalRuns: number;
  distanceModifier: number;
  adaptationMessage: string;
};

export type RunningSessionCompletion = {
  session: RunningSession;
  actualDistanceKm: number;
  durationMinutes: number;
  effort: RunningEffort;
};
