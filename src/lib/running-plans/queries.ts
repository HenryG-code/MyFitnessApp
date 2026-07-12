import { createRunningPlanState } from "@/src/lib/running-plans/plan";
import type {
  RunningEffort,
  RunningExperience,
  RunningPlanState,
  RunningSession,
} from "@/src/lib/running-plans/types";
import type { Json, UserPreferences } from "@/src/lib/supabase/database.types";
import {
  ensureUserPreferences,
  updateUserPreferences,
} from "@/src/lib/user-preferences/queries";
import { createWorkout } from "@/src/lib/workouts/queries";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toJson(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export function parseRunningPlan(
  preferences: UserPreferences | null
): RunningPlanState | null {
  const value = preferences?.running_plan;

  if (
    !isRecord(value) ||
    value.version !== 1 ||
    typeof value.goalKm !== "number" ||
    !["starting", "building", "regular"].includes(String(value.experience)) ||
    typeof value.currentWeek !== "number" ||
    !Array.isArray(value.completedSessions) ||
    !["active", "completed"].includes(String(value.status))
  ) {
    return null;
  }

  return value as unknown as RunningPlanState;
}

export async function loadRunningPlan() {
  return parseRunningPlan(await ensureUserPreferences());
}

export async function startRunningPlan(
  goalKm: number,
  experience: RunningExperience
) {
  const state = createRunningPlanState(goalKm, experience);
  await saveRunningPlan(state);
  return state;
}

export async function saveRunningPlan(state: RunningPlanState) {
  await updateUserPreferences({ running_plan: toJson(state) });
  return state;
}

export async function logRunningSession(input: {
  plan: RunningPlanState;
  session: RunningSession;
  distanceKm: number;
  durationMinutes: number;
  effort: RunningEffort;
}) {
  const today = new Date().toISOString().slice(0, 10);
  return createWorkout({
    title: `Run · ${input.session.title}`,
    workout_date: today,
    duration_minutes: input.durationMinutes,
    notes: `Running Coach · ${input.plan.goalKm} km goal · Week ${input.plan.currentWeek}, attempt ${input.plan.weekAttempt} · Effort: ${input.effort}.`,
    exercises: [
      {
        exercise_name: "Running",
        sets: null,
        reps: null,
        weight: null,
        distance_km: input.distanceKm,
        duration_minutes: input.durationMinutes,
        notes: `Planned distance: ${input.session.distanceKm} km`,
      },
    ],
  });
}
