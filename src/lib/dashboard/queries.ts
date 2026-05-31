import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import type {
  DailyHabit,
  Profile,
  WeightLog,
  Workout,
} from "@/src/lib/supabase/database.types";

export type DashboardData = {
  profile: Profile | null;
  goalWeightKg: number | null;
  firstWeight: WeightLog | null;
  latestWeight: WeightLog | null;
  recentWeights: WeightLog[];
  todayHabits: DailyHabit | null;
  recentHabits: DailyHabit[];
  latestWorkout: Workout | null;
  workoutsThisWeek: Workout[];
  workoutsLastSevenDays: Workout[];
};

export type WeeklyConsistencyPoint = {
  date: string;
  day: string;
  habitScore: number;
  workoutScore: number;
  weightScore: number;
  consistencyScore: number;
};

export type WeeklyWorkoutStats = {
  workoutsCompleted: number;
  totalMinutes: number;
  workoutDays: number;
};

export type WeightProgress = {
  currentWeight: number | null;
  firstWeight: number | null;
  totalChange: number | null;
  goalWeight: number | null;
  distanceFromGoal: number | null;
  goalReached: boolean;
};

export const habitKeys = [
  "sleep_8_hours",
  "trained",
  "walked_10k_steps",
  "ate_healthy",
  "no_late_food",
  "limited_alcohol",
  "clean_environment",
] as const;

async function getAuthenticatedUserId() {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("You must be logged in to view dashboard data.");
  }

  return { supabase, userId: user.id };
}

export function getDateInputValue(date = new Date()) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function getDateDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return getDateInputValue(date);
}

function getStartOfWeekDate() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());

  return getDateInputValue(start);
}

export function countCompletedHabits(row: DailyHabit | null) {
  if (!row) {
    return 0;
  }

  return habitKeys.filter((key) => row[key]).length;
}

function formatShortDay(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function getLastSevenDateValues() {
  return Array.from({ length: 7 }, (_item, index) => getDateDaysAgo(6 - index));
}

function getWorkoutDate(workout: Workout) {
  return workout.workout_date;
}

export function buildWeeklyConsistencyData(
  data: DashboardData
): WeeklyConsistencyPoint[] {
  return getLastSevenDateValues().map((date) => {
    const habitRow = data.recentHabits.find(
      (habit) => habit.habit_date === date
    );
    const habitScore = Math.round(
      (countCompletedHabits(habitRow ?? null) / habitKeys.length) * 100
    );
    const workoutScore = data.workoutsLastSevenDays.some(
      (workout) => getWorkoutDate(workout) === date
    )
      ? 100
      : 0;
    const weightScore = data.recentWeights.some(
      (weightLog) => weightLog.logged_at === date
    )
      ? 100
      : 0;
    const consistencyScore = Math.round(
      (habitScore + workoutScore + weightScore) / 3
    );

    return {
      date,
      day: formatShortDay(date),
      habitScore,
      workoutScore,
      weightScore,
      consistencyScore,
    };
  });
}

export function calculateAverageHabitCompletion(data: DashboardData) {
  const weeklyData = buildWeeklyConsistencyData(data);
  const total = weeklyData.reduce((sum, point) => sum + point.habitScore, 0);

  return Math.round(total / weeklyData.length);
}

export function calculateWeeklyWorkoutStats(
  workouts: Workout[]
): WeeklyWorkoutStats {
  const workoutDays = new Set(workouts.map((workout) => workout.workout_date));

  return {
    workoutsCompleted: workouts.length,
    totalMinutes: workouts.reduce(
      (total, workout) => total + (workout.duration_minutes ?? 0),
      0
    ),
    workoutDays: workoutDays.size,
  };
}

export function calculateWeightProgress(data: DashboardData): WeightProgress {
  const currentWeight = data.latestWeight?.weight_kg ?? null;
  const firstWeight = data.firstWeight?.weight_kg ?? null;
  const goalWeight = data.goalWeightKg;
  const totalChange =
    currentWeight !== null && firstWeight !== null
      ? currentWeight - firstWeight
      : null;
  const distanceFromGoal =
    currentWeight !== null && goalWeight !== null
      ? Math.abs(currentWeight - goalWeight)
      : null;
  const goalReached =
    currentWeight !== null &&
    goalWeight !== null &&
    (firstWeight !== null
      ? firstWeight > goalWeight
        ? currentWeight <= goalWeight
        : currentWeight >= goalWeight
      : Math.abs(currentWeight - goalWeight) < 0.05);

  return {
    currentWeight,
    firstWeight,
    totalChange,
    goalWeight,
    distanceFromGoal,
    goalReached,
  };
}

export function generateProgressInsights(data: DashboardData) {
  const weeklyData = buildWeeklyConsistencyData(data);
  const workoutStats = calculateWeeklyWorkoutStats(data.workoutsLastSevenDays);
  const averageHabitCompletion = calculateAverageHabitCompletion(data);
  const weightProgress = calculateWeightProgress(data);
  const trainingScore = Math.round((workoutStats.workoutDays / 7) * 100);
  const weightLoggingScore = Math.round((data.recentWeights.length / 7) * 100);
  const areas = [
    { label: "habits", score: averageHabitCompletion },
    { label: "training", score: trainingScore },
    { label: "weight logging", score: weightLoggingScore },
  ].sort((first, second) => second.score - first.score);
  const strongestArea = areas[0];
  const focusArea = areas[areas.length - 1];
  const insights: string[] = [];

  if (workoutStats.workoutsCompleted >= 4) {
    insights.push(
      `Strong training week: you logged ${workoutStats.workoutsCompleted} workouts.`
    );
  } else if (workoutStats.workoutsCompleted > 0) {
    insights.push(
      `You logged ${workoutStats.workoutsCompleted} workouts this week.`
    );
  } else {
    insights.push("No workouts logged this week yet.");
  }

  if (averageHabitCompletion >= 80) {
    insights.push(
      `Excellent consistency: your habits averaged ${averageHabitCompletion}% this week.`
    );
  } else if (averageHabitCompletion >= 50) {
    insights.push(
      `Good progress: your habits averaged ${averageHabitCompletion}% this week.`
    );
  } else {
    insights.push(
      "Small steps count: aim to complete a few more habits tomorrow."
    );
  }

  if (weightProgress.totalChange !== null) {
    insights.push(
      `Your weight changed by ${Math.abs(weightProgress.totalChange).toFixed(
        1
      )} kg since your first log.`
    );
  } else {
    insights.push("Add your first weight log to unlock weight trends.");
  }

  if (weightProgress.goalWeight !== null && weightProgress.goalReached) {
    insights.push("Goal reached based on your latest log.");
  } else if (
    weightProgress.goalWeight !== null &&
    weightProgress.distanceFromGoal !== null
  ) {
    insights.push(
      `You are ${weightProgress.distanceFromGoal.toFixed(1)} kg from your goal.`
    );
  }

  insights.push(
    `Your strongest consistency area this week was ${strongestArea.label}.`
  );

  if (focusArea.label === "training") {
    insights.push("Focus area: training. Try logging one planned session this week.");
  } else if (focusArea.label === "weight logging") {
    insights.push("Focus area: weight check-ins. A quick log can clarify the trend.");
  } else {
    insights.push("Focus area: habits. Pick one habit to complete tomorrow.");
  }

  if (weeklyData.every((point) => point.consistencyScore === 0)) {
    return [
      "Start with one check-in today to begin your weekly rhythm.",
      "Add your first workout to start your training history.",
      "Update today's habits to see your consistency.",
      "Add your first weight log to unlock weight trends.",
    ];
  }

  return insights.slice(0, 6);
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const { supabase, userId } = await getAuthenticatedUserId();
  const today = getDateInputValue();
  const sevenDaysAgo = getDateDaysAgo(6);
  const startOfWeek = getStartOfWeekDate();

  const [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitsResult,
    recentHabitsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("logged_at", sevenDaysAgo)
      .lte("logged_at", today)
      .order("logged_at", { ascending: true }),
    supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", userId)
      .eq("habit_date", today)
      .maybeSingle(),
    supabase
      .from("daily_habits")
      .select("*")
      .eq("user_id", userId)
      .gte("habit_date", sevenDaysAgo)
      .lte("habit_date", today)
      .order("habit_date", { ascending: true }),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", startOfWeek)
      .order("workout_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("workout_date", sevenDaysAgo)
      .lte("workout_date", today)
      .order("workout_date", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const results = [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitsResult,
    recentHabitsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  return {
    profile: profileResult.data,
    goalWeightKg: profileResult.data?.goal_weight_kg ?? null,
    firstWeight: firstWeightResult.data,
    latestWeight: latestWeightResult.data,
    recentWeights: recentWeightsResult.data ?? [],
    todayHabits: todayHabitsResult.data,
    recentHabits: recentHabitsResult.data ?? [],
    latestWorkout: latestWorkoutResult.data,
    workoutsThisWeek: workoutsThisWeekResult.data ?? [],
    workoutsLastSevenDays: workoutsLastSevenDaysResult.data ?? [],
  };
}
