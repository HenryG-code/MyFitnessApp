import { createBrowserSupabaseClient } from "@/src/lib/supabase/client";
import {
  calculateDayTotals,
  calculateWeekTotals,
  createRecipeMap,
} from "@/src/lib/meal-planner/calculations";
import {
  createEmptyMealPlan,
  normalizeMealPlanState,
} from "@/src/lib/meal-planner/storage";
import {
  weekdays,
  type MealPlanState,
  type MealPlanTotals,
  type Weekday,
} from "@/src/lib/meal-planner/types";
import { getAllRecipes } from "@/src/lib/recipes/data";
import {
  buildHabitDaySummary,
  ensureDefaultHabits,
  getDateDaysAgo,
  getDateInputValue,
  type HabitDaySummary,
} from "@/src/lib/habits/queries";
import type {
  HabitCompletion,
  HabitDefinition,
  Profile,
  WeightLog,
  Workout,
} from "@/src/lib/supabase/database.types";
import { isTrainingGoal } from "@/src/lib/training-plans/storage";
import type { TrainingGoal } from "@/src/lib/training-plans/types";

export type DashboardData = {
  profile: Profile | null;
  goalWeightKg: number | null;
  firstWeight: WeightLog | null;
  latestWeight: WeightLog | null;
  recentWeights: WeightLog[];
  habitDefinitions: HabitDefinition[];
  todayHabitCompletions: HabitCompletion[];
  recentHabitCompletions: HabitCompletion[];
  todayHabits: HabitDaySummary;
  recentHabits: HabitDaySummary[];
  mealPlan: MealPlanState;
  latestWorkout: Workout | null;
  workoutsThisWeek: Workout[];
  workoutsLastSevenDays: Workout[];
  selectedTrainingGoal: TrainingGoal | null;
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

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  plannedMeals: number;
};

export type MacroBreakdownItem = {
  label: "Protein" | "Carbs" | "Fat";
  grams: number;
  percentage: number;
  barClassName: string;
};

export type FitnessJourneyItem = {
  label: string;
  value: string;
  detail: string;
  href: string;
};

const recipeMap = createRecipeMap(getAllRecipes());

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

function getStartOfWeekDate() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());

  return getDateInputValue(start);
}

function getCurrentWeekday(date = new Date()): Weekday {
  return weekdays[(date.getDay() + 6) % 7] as Weekday;
}

export function countCompletedHabits(row: HabitDaySummary | null) {
  return row?.completed ?? 0;
}

export function countTotalHabits(row: HabitDaySummary | null) {
  return row?.total ?? 0;
}

export function getHabitCompletionPercent(row: HabitDaySummary | null) {
  return row?.percentage ?? 0;
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
    const habitRow = data.recentHabits.find((habit) => habit.date === date);
    const habitScore = getHabitCompletionPercent(habitRow ?? null);
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

export function calculateTodayMacros(data: DashboardData): MacroTotals {
  const today = getCurrentWeekday();
  const totals = calculateDayTotals(data.mealPlan, today, recipeMap);

  return {
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fat: totals.fat,
    plannedMeals: totals.plannedMeals,
  };
}

export function calculateWeeklyMacros(data: DashboardData): MealPlanTotals {
  return calculateWeekTotals(data.mealPlan, recipeMap);
}

export function calculateMacroBreakdown(
  macros: Pick<MacroTotals, "protein" | "carbs" | "fat">
): MacroBreakdownItem[] {
  const macroGrams = macros.protein + macros.carbs + macros.fat;
  const getPercentage = (value: number) =>
    macroGrams > 0 ? Math.round((value / macroGrams) * 100) : 0;

  return [
    {
      label: "Protein",
      grams: macros.protein,
      percentage: getPercentage(macros.protein),
      barClassName: "bg-accent",
    },
    {
      label: "Carbs",
      grams: macros.carbs,
      percentage: getPercentage(macros.carbs),
      barClassName: "bg-orange-500",
    },
    {
      label: "Fat",
      grams: macros.fat,
      percentage: getPercentage(macros.fat),
      barClassName: "bg-red-500",
    },
  ];
}

export function calculatePlannedMealsCount(data: DashboardData) {
  return calculateWeeklyMacros(data).plannedMealsCount;
}

export function generateDashboardMotivation(data: DashboardData) {
  const completedHabits = countCompletedHabits(data.todayHabits);
  const totalHabits = countTotalHabits(data.todayHabits);
  const habitPercent = getHabitCompletionPercent(data.todayHabits);
  const weeklyWorkoutStats = calculateWeeklyWorkoutStats(
    data.workoutsLastSevenDays
  );
  const todayMacros = calculateTodayMacros(data);
  const weeklyMacros = calculateWeeklyMacros(data);
  const weightProgress = calculateWeightProgress(data);

  if (totalHabits > 0 && completedHabits === totalHabits) {
    return "Clean sweep today. Every habit is checked off.";
  }

  if (todayMacros.plannedMeals >= 3 && weeklyWorkoutStats.workoutsCompleted > 0) {
    return "Training and meals are both lined up. That is strong momentum.";
  }

  if (weeklyWorkoutStats.workoutsCompleted >= 4) {
    return "Strong training week. You are building real momentum.";
  }

  if (weeklyMacros.plannedMealsCount >= 14) {
    return "Your meals are mapped out. Keep stacking the easy wins.";
  }

  if (habitPercent >= 70) {
    return "Good consistency today. Keep the streak alive.";
  }

  if (weeklyWorkoutStats.workoutsCompleted === 0) {
    return "Start small today. One logged session beats zero.";
  }

  if (weightProgress.currentWeight === null) {
    return "Add a weight check-in to start tracking your trend.";
  }

  if (todayMacros.plannedMeals === 0) {
    return "Plan one meal for today and make the next choice easier.";
  }

  return "Keep moving. Small logged wins compound.";
}

export function buildFitnessJourneySummary(
  data: DashboardData
): FitnessJourneyItem[] {
  const weightProgress = calculateWeightProgress(data);
  const weeklyWorkoutStats = calculateWeeklyWorkoutStats(
    data.workoutsLastSevenDays
  );
  const averageHabitCompletion = calculateAverageHabitCompletion(data);
  const weeklyMacros = calculateWeeklyMacros(data);
  const plannedMealsCount = calculatePlannedMealsCount(data);

  return [
    {
      label: "Weight",
      value:
        weightProgress.currentWeight !== null
          ? `${weightProgress.currentWeight.toFixed(1)} kg`
          : "Not started",
      detail:
        weightProgress.totalChange !== null
          ? `${Math.abs(weightProgress.totalChange).toFixed(
              1
            )} kg total change tracked.`
          : "Add your first log to see your trend.",
      href: "/weight",
    },
    {
      label: "Training",
      value: `${weeklyWorkoutStats.workoutsCompleted} this week`,
      detail:
        weeklyWorkoutStats.totalMinutes > 0
          ? `${weeklyWorkoutStats.totalMinutes} minutes logged over 7 days.`
          : "Log a session to build your training history.",
      href: "/workouts",
    },
    {
      label: "Habits",
      value: `${averageHabitCompletion}% avg`,
      detail: "Average completion across the last 7 days.",
      href: "/habits",
    },
    {
      label: "Nutrition",
      value: `${weeklyMacros.weeklyProtein}g protein`,
      detail:
        plannedMealsCount > 0
          ? `${plannedMealsCount} meals planned this week.`
          : "Plan meals to see nutrition totals.",
      href: "/meal-planner",
    },
    {
      label: "Planning",
      value: plannedMealsCount > 0 ? "Week mapped" : "Open slots",
      detail:
        plannedMealsCount > 0
          ? "Your meal plan is feeding the grocery list."
          : "Choose recipes to build your week.",
      href: "/grocery-list",
    },
  ];
}

export function generateProgressInsights(data: DashboardData) {
  const weeklyData = buildWeeklyConsistencyData(data);
  const workoutStats = calculateWeeklyWorkoutStats(data.workoutsLastSevenDays);
  const averageHabitCompletion = calculateAverageHabitCompletion(data);
  const weightProgress = calculateWeightProgress(data);
  const todayMacros = calculateTodayMacros(data);
  const weeklyMacros = calculateWeeklyMacros(data);
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

  if (todayMacros.plannedMeals > 0) {
    insights.push(
      `Today you have ${todayMacros.plannedMeals} planned meals totaling ${todayMacros.protein}g protein.`
    );
  } else {
    insights.push("Plan one meal today to make nutrition easier to follow.");
  }

  if (weeklyMacros.plannedMealsCount > 0) {
    insights.push(
      `Your week includes ${weeklyMacros.plannedMealsCount} planned meals and ${weeklyMacros.weeklyCalories} calories.`
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
  const habitDefinitions = (await ensureDefaultHabits()).filter(
    (habit) => habit.is_active
  );

  const [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitCompletionsResult,
    recentHabitCompletionsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
    preferencesResult,
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
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("completed_date", today),
    supabase
      .from("habit_completions")
      .select("*")
      .eq("user_id", userId)
      .gte("completed_date", sevenDaysAgo)
      .lte("completed_date", today)
      .order("completed_date", { ascending: true }),
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
    supabase
      .from("user_preferences")
      .select("meal_plan, selected_training_goal")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const results = [
    firstWeightResult,
    latestWeightResult,
    recentWeightsResult,
    todayHabitCompletionsResult,
    recentHabitCompletionsResult,
    latestWorkoutResult,
    workoutsThisWeekResult,
    workoutsLastSevenDaysResult,
    profileResult,
    preferencesResult,
  ];
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }

  const todayHabitCompletions = todayHabitCompletionsResult.data ?? [];
  const recentHabitCompletions = recentHabitCompletionsResult.data ?? [];
  const recentHabits = getLastSevenDateValues().map((date) =>
    buildHabitDaySummary(
      date,
      habitDefinitions,
      recentHabitCompletions.filter(
        (completion) => completion.completed_date === date
      )
    )
  );

  return {
    profile: profileResult.data,
    goalWeightKg: profileResult.data?.goal_weight_kg ?? null,
    firstWeight: firstWeightResult.data,
    latestWeight: latestWeightResult.data,
    recentWeights: recentWeightsResult.data ?? [],
    habitDefinitions,
    todayHabitCompletions,
    recentHabitCompletions,
    todayHabits: buildHabitDaySummary(today, habitDefinitions, todayHabitCompletions),
    recentHabits,
    mealPlan: preferencesResult.data?.meal_plan
      ? normalizeMealPlanState(preferencesResult.data.meal_plan)
      : createEmptyMealPlan(),
    latestWorkout: latestWorkoutResult.data,
    workoutsThisWeek: workoutsThisWeekResult.data ?? [],
    workoutsLastSevenDays: workoutsLastSevenDaysResult.data ?? [],
    selectedTrainingGoal: isTrainingGoal(
      preferencesResult.data?.selected_training_goal
    )
      ? preferencesResult.data.selected_training_goal
      : null,
  };
}
