export type TrainingGoal =
  | "Lose weight"
  | "Gain muscle"
  | "Get fit"
  | "Build strength"
  | "Improve cardio"
  | "General health";

export type TrainingLevel = "Beginner" | "Intermediate";

// Small shared constants live here (not in data.ts) so client bundles that
// only need goal/level options don't pull in the full plan catalog.
export const trainingGoals: TrainingGoal[] = [
  "Lose weight",
  "Gain muscle",
  "Get fit",
  "Build strength",
  "Improve cardio",
  "General health",
];

export const defaultTrainingGoal: TrainingGoal = "Get fit";
export const trainingLevels: TrainingLevel[] = ["Beginner", "Intermediate"];
export const defaultTrainingLevel: TrainingLevel = "Beginner";

export type SessionType =
  | "Strength"
  | "Cardio"
  | "Mobility"
  | "Yoga"
  | "Recovery"
  | "Hybrid";

export type Intensity = "Light" | "Moderate" | "Hard";

export type TrainingExercise = {
  name: string;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  notes?: string;
};

export type TrainingSession = {
  dayLabel: string;
  sessionType: SessionType;
  title: string;
  durationMinutes: number;
  intensity: Intensity;
  exercises: TrainingExercise[];
  notes: string;
};

export type TrainingPlan = {
  slug: string;
  goal: TrainingGoal;
  level: TrainingLevel;
  title: string;
  description: string;
  recommendedFor: string;
  weeklyFocus: string;
  days: TrainingSession[];
};

export type TrainingPlanSummary = {
  sessions: number;
  weeklyMinutes: number;
  strengthSessions: number;
  cardioSessions: number;
  mobilityRecoverySessions: number;
};
