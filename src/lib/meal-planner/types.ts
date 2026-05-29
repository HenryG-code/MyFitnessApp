export const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const mealSlots = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

export type Weekday = (typeof weekdays)[number];

export type MealSlot = (typeof mealSlots)[number];

export type MealPlanSelection = string | null;

export type MealPlanDay = Record<MealSlot, MealPlanSelection>;

export type MealPlanState = Record<Weekday, MealPlanDay>;

export type DayTotals = {
  calories: number;
  protein: number;
  plannedMeals: number;
};

export type MealPlanTotals = {
  weeklyCalories: number;
  weeklyProtein: number;
  averageDailyCalories: number;
  averageDailyProtein: number;
  plannedMealsCount: number;
};
