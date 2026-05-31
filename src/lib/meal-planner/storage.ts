import {
  mealSlots,
  weekdays,
  type MealPlanDay,
  type MealPlanState,
} from "@/src/lib/meal-planner/types";

export const mealPlannerStorageKey = "liftlog-meal-planner-v1";

export function createEmptyMealPlan(): MealPlanState {
  return weekdays.reduce((week, day) => {
    week[day] = mealSlots.reduce((slots, slot) => {
      slots[slot] = null;
      return slots;
    }, {} as MealPlanDay);

    return week;
  }, {} as MealPlanState);
}

export function isMealPlanState(value: unknown): value is MealPlanState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<string, Partial<Record<string, unknown>>>>;

  return weekdays.every((day) => {
    const dayValue = candidate[day];

    if (!dayValue || typeof dayValue !== "object") {
      return false;
    }

    return mealSlots.every((slot) => {
      const selection = dayValue[slot];
      return selection === null || typeof selection === "string";
    });
  });
}

export function normalizeMealPlanState(value: unknown): MealPlanState {
  const emptyPlan = createEmptyMealPlan();

  if (!isMealPlanState(value)) {
    return emptyPlan;
  }

  return weekdays.reduce((week, day) => {
    week[day] = mealSlots.reduce((slots, slot) => {
      slots[slot] = value[day][slot];
      return slots;
    }, {} as MealPlanDay);

    return week;
  }, {} as MealPlanState);
}

export function hasPlannedMeals(plan: MealPlanState) {
  return weekdays.some((day) =>
    mealSlots.some((slot) => Boolean(plan[day][slot]))
  );
}

export function loadMealPlanFromStorage() {
  if (typeof window === "undefined") {
    return createEmptyMealPlan();
  }

  try {
    const savedPlan = window.localStorage.getItem(mealPlannerStorageKey);

    if (!savedPlan) {
      return createEmptyMealPlan();
    }

    return normalizeMealPlanState(JSON.parse(savedPlan));
  } catch {
    return createEmptyMealPlan();
  }
}

export function saveMealPlanToStorage(plan: MealPlanState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mealPlannerStorageKey, JSON.stringify(plan));
}

export function clearMealPlanStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(mealPlannerStorageKey);
}
