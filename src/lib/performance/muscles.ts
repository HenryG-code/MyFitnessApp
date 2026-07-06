import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import { getDateDaysAgo, getDateInputValue } from "@/src/lib/habits/queries";
import type {
  Workout,
  WorkoutExercise,
} from "@/src/lib/supabase/database.types";

export type MuscleGroupId =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "back"
  | "traps";

export type MuscleState =
  | "fresh" // trained < 24h ago
  | "recovering" // trained 24–72h ago
  | "ready" // recovered, trained within 14 days
  | "neglected"; // not trained in 14+ days

export type MuscleGroupStatus = {
  id: MuscleGroupId;
  name: string;
  weeklySets: number;
  previousWeeklySets: number;
  targetRange: [number, number];
  lastTrained: string | null;
  daysSinceTrained: number | null;
  recoveryPercent: number;
  state: MuscleState;
  topExercises: string[];
};

export type BodyIntelligence = {
  groups: Record<MuscleGroupId, MuscleGroupStatus>;
  neglected: MuscleGroupStatus[];
  mostWorked: MuscleGroupStatus | null;
  totalWeeklySets: number;
};

export const muscleGroupNames: Record<MuscleGroupId, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  core: "Core",
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  back: "Back",
  traps: "Traps",
};

const weeklyTargets: Record<MuscleGroupId, [number, number]> = {
  chest: [10, 18],
  shoulders: [8, 16],
  biceps: [6, 14],
  triceps: [6, 14],
  forearms: [2, 8],
  core: [6, 14],
  quads: [8, 16],
  hamstrings: [6, 14],
  glutes: [8, 16],
  calves: [4, 10],
  back: [10, 18],
  traps: [4, 10],
};

type MuscleContribution = Partial<Record<MuscleGroupId, number>>;

/** Keyword → muscle contribution table. First match wins per rule; all matching rules apply. */
const exerciseRules: Array<[RegExp, MuscleContribution]> = [
  [/bench|chest press|push[- ]?up|dip|fly|pec/, { chest: 1, triceps: 0.5, shoulders: 0.3 }],
  [/overhead|shoulder press|ohp|military|lateral raise|front raise|arnold/, { shoulders: 1, triceps: 0.4 }],
  [/pull[- ]?up|chin[- ]?up|lat pull|pulldown/, { back: 1, biceps: 0.5 }],
  [/\brow\b|rowing|seated row|barbell row|dumbbell row|cable row/, { back: 1, biceps: 0.4, traps: 0.3 }],
  [/deadlift|rdl|romanian|hip hinge|good morning/, { hamstrings: 1, glutes: 0.8, back: 0.5, traps: 0.3 }],
  [/squat|leg press|hack/, { quads: 1, glutes: 0.7, core: 0.2 }],
  [/lunge|split squat|step[- ]?up/, { quads: 1, glutes: 0.8 }],
  [/hamstring|leg curl/, { hamstrings: 1 }],
  [/leg extension/, { quads: 1 }],
  [/hip thrust|glute|kickback/, { glutes: 1, hamstrings: 0.3 }],
  [/calf|calves/, { calves: 1 }],
  [/curl/, { biceps: 1, forearms: 0.3 }],
  [/tricep|pushdown|skull|extension/, { triceps: 1 }],
  [/shrug/, { traps: 1 }],
  [/plank|crunch|sit[- ]?up|dead bug|ab |abs|core|leg raise|russian|pallof|hollow/, { core: 1 }],
  [/farmer|carry/, { forearms: 1, traps: 0.6, core: 0.5 }],
  [/swing|kettlebell/, { glutes: 1, hamstrings: 0.7, core: 0.4 }],
  [/clean|snatch|jerk/, { shoulders: 0.7, traps: 0.7, quads: 0.6, glutes: 0.6 }],
  [/burpee|thruster/, { quads: 0.7, chest: 0.5, shoulders: 0.5, core: 0.4 }],
];

export function mapExerciseToMuscles(exerciseName: string): MuscleContribution {
  const name = exerciseName.toLowerCase();
  const combined: MuscleContribution = {};
  let matched = false;

  for (const [pattern, contribution] of exerciseRules) {
    if (pattern.test(name)) {
      matched = true;
      for (const [muscle, weight] of Object.entries(contribution)) {
        const id = muscle as MuscleGroupId;
        combined[id] = Math.max(combined[id] ?? 0, weight);
      }
    }
  }

  return matched ? combined : {};
}

export type DatedExercise = WorkoutExercise & { workout_date: string };

export async function fetchDatedExercises(days: number) {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const since = getDateDaysAgo(days - 1);
  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .gte("workout_date", since)
    .order("workout_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!workouts.length) {
    return { workouts: [] as Workout[], exercises: [] as DatedExercise[] };
  }

  const { data: exercises, error: exercisesError } = await supabase
    .from("workout_exercises")
    .select("*")
    .in(
      "workout_id",
      workouts.map((workout) => workout.id)
    );

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  const dateByWorkout = new Map(
    workouts.map((workout) => [workout.id, workout.workout_date])
  );

  return {
    workouts,
    exercises: exercises.map((exercise) => ({
      ...exercise,
      workout_date: dateByWorkout.get(exercise.workout_id) ?? "",
    })),
  };
}

export function analyzeBodyIntelligence(
  exercises: DatedExercise[]
): BodyIntelligence {
  const today = getDateInputValue();
  const weekAgo = getDateDaysAgo(6);
  const twoWeeksAgo = getDateDaysAgo(13);

  const groups = {} as Record<MuscleGroupId, MuscleGroupStatus>;

  (Object.keys(muscleGroupNames) as MuscleGroupId[]).forEach((id) => {
    groups[id] = {
      id,
      name: muscleGroupNames[id],
      weeklySets: 0,
      previousWeeklySets: 0,
      targetRange: weeklyTargets[id],
      lastTrained: null,
      daysSinceTrained: null,
      recoveryPercent: 100,
      state: "neglected",
      topExercises: [],
    };
  });

  const exerciseCounts = new Map<MuscleGroupId, Map<string, number>>();

  exercises.forEach((exercise) => {
    const contribution = mapExerciseToMuscles(exercise.exercise_name);
    const sets = exercise.sets ?? 1;

    for (const [muscle, weight] of Object.entries(contribution)) {
      const id = muscle as MuscleGroupId;
      const group = groups[id];
      const effectiveSets = sets * weight;

      if (exercise.workout_date >= weekAgo) {
        group.weeklySets += effectiveSets;

        const counts = exerciseCounts.get(id) ?? new Map<string, number>();
        counts.set(
          exercise.exercise_name,
          (counts.get(exercise.exercise_name) ?? 0) + effectiveSets
        );
        exerciseCounts.set(id, counts);
      } else if (exercise.workout_date >= twoWeeksAgo) {
        group.previousWeeklySets += effectiveSets;
      }

      if (!group.lastTrained || exercise.workout_date > group.lastTrained) {
        group.lastTrained = exercise.workout_date;
      }
    }
  });

  const todayTime = new Date(`${today}T00:00:00`).getTime();

  (Object.values(groups) as MuscleGroupStatus[]).forEach((group) => {
    group.weeklySets = Math.round(group.weeklySets);
    group.previousWeeklySets = Math.round(group.previousWeeklySets);

    if (group.lastTrained) {
      const days = Math.max(
        0,
        Math.round(
          (todayTime - new Date(`${group.lastTrained}T00:00:00`).getTime()) /
            86_400_000
        )
      );
      group.daysSinceTrained = days;
      group.recoveryPercent = Math.min(100, Math.round((days / 3) * 100));
      group.state =
        days < 1 ? "fresh" : days < 3 ? "recovering" : days <= 14 ? "ready" : "neglected";
    }

    const counts = exerciseCounts.get(group.id);
    if (counts) {
      group.topExercises = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name);
    }
  });

  const worked = (Object.values(groups) as MuscleGroupStatus[]).filter(
    (group) => group.weeklySets > 0
  );

  return {
    groups,
    neglected: (Object.values(groups) as MuscleGroupStatus[]).filter(
      (group) => group.state === "neglected"
    ),
    mostWorked: worked.length
      ? worked.reduce((max, group) =>
          group.weeklySets > max.weeklySets ? group : max
        )
      : null,
    totalWeeklySets: worked.reduce((sum, group) => sum + group.weeklySets, 0),
  };
}
