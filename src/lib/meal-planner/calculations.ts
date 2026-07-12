import type { Recipe } from "@/src/lib/recipes/types";
import {
  mealSlots,
  weekdays,
  type DayTotals,
  type MealPlanState,
  type MealPlanTotals,
  type MealSlot,
  type Weekday,
} from "@/src/lib/meal-planner/types";

export function createRecipeMap(recipes: Recipe[]) {
  return new Map(recipes.map((recipe) => [recipe.slug, recipe]));
}

export function getPlannedRecipe(
  plan: MealPlanState,
  day: Weekday,
  slot: MealSlot,
  recipeMap: Map<string, Recipe>
) {
  const slug = plan[day][slot];

  if (!slug) {
    return null;
  }

  return recipeMap.get(slug) ?? null;
}

export function calculateDayTotals(
  plan: MealPlanState,
  day: Weekday,
  recipeMap: Map<string, Recipe>
): DayTotals {
  return mealSlots.reduce(
    (totals, slot) => {
      const recipe = getPlannedRecipe(plan, day, slot, recipeMap);

      if (!recipe) {
        return totals;
      }

      return {
        calories: totals.calories + recipe.calories,
        protein: totals.protein + recipe.protein,
        carbs: totals.carbs + recipe.carbs,
        fat: totals.fat + recipe.fat,
        plannedMeals: totals.plannedMeals + 1,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, plannedMeals: 0 }
  );
}

export function calculateWeekTotals(
  plan: MealPlanState,
  recipeMap: Map<string, Recipe>
): MealPlanTotals {
  const totals = weekdays.reduce(
    (weekTotals, day) => {
      const dayTotals = calculateDayTotals(plan, day, recipeMap);

      return {
        weeklyCalories: weekTotals.weeklyCalories + dayTotals.calories,
        weeklyProtein: weekTotals.weeklyProtein + dayTotals.protein,
        weeklyCarbs: weekTotals.weeklyCarbs + dayTotals.carbs,
        weeklyFat: weekTotals.weeklyFat + dayTotals.fat,
        plannedMealsCount:
          weekTotals.plannedMealsCount + dayTotals.plannedMeals,
      };
    },
    {
      weeklyCalories: 0,
      weeklyProtein: 0,
      weeklyCarbs: 0,
      weeklyFat: 0,
      plannedMealsCount: 0,
    }
  );

  return {
    ...totals,
    averageDailyCalories: Math.round(totals.weeklyCalories / weekdays.length),
    averageDailyProtein: Math.round(totals.weeklyProtein / weekdays.length),
    averageDailyCarbs: Math.round(totals.weeklyCarbs / weekdays.length),
    averageDailyFat: Math.round(totals.weeklyFat / weekdays.length),
  };
}
