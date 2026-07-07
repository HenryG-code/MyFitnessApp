import type { CheckedGroceryItems } from "@/src/lib/grocery-list/types";

export const groceryCheckedStorageKey = "liftlog-grocery-list-checked-v1";
export const groceryWeekStorageKey = "logfit-grocery-week-v1";

/** Monday-based week key (YYYY-MM-DD), matching the meal-planner week. */
export function getCurrentGroceryWeekKey(date = new Date()) {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const month = `${monday.getMonth() + 1}`.padStart(2, "0");
  const day = `${monday.getDate()}`.padStart(2, "0");
  return `${monday.getFullYear()}-${month}-${day}`;
}

export function loadGroceryWeekKey() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(groceryWeekStorageKey);
  } catch {
    return null;
  }
}

export function saveGroceryWeekKey(weekKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(groceryWeekStorageKey, weekKey);
  } catch {
    // Storage unavailable — the reset simply runs again next load.
  }
}

// Memoised per page load so concurrent mounts (e.g. React StrictMode's
// double-invoke) agree on whether this load crossed into a new week.
let weeklyResetEvaluation: { week: string; wasNewWeek: boolean } | null = null;

/**
 * Returns true when this page load is the first of a new week. Clears the
 * locally checked items and stamps the new week key as a side effect.
 */
export function evaluateWeeklyGroceryReset() {
  const currentWeek = getCurrentGroceryWeekKey();

  if (weeklyResetEvaluation?.week === currentWeek) {
    return weeklyResetEvaluation.wasNewWeek;
  }

  const storedWeek = loadGroceryWeekKey();
  const wasNewWeek = storedWeek !== null && storedWeek !== currentWeek;

  if (wasNewWeek) {
    clearCheckedGroceryItems();
  }

  saveGroceryWeekKey(currentWeek);
  weeklyResetEvaluation = { week: currentWeek, wasNewWeek };

  return wasNewWeek;
}

export function isCheckedGroceryItems(value: unknown): value is CheckedGroceryItems {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "boolean");
}

export function normalizeCheckedGroceryItems(value: unknown): CheckedGroceryItems {
  return isCheckedGroceryItems(value) ? value : {};
}

export function hasCheckedGroceryItems(value: CheckedGroceryItems) {
  return Object.keys(value).length > 0;
}

export function loadCheckedGroceryItems() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedItems = window.localStorage.getItem(groceryCheckedStorageKey);

    if (!savedItems) {
      return {};
    }

    const parsedItems = JSON.parse(savedItems);
    return isCheckedGroceryItems(parsedItems) ? parsedItems : {};
  } catch {
    return {};
  }
}

export function saveCheckedGroceryItems(checkedItems: CheckedGroceryItems) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    groceryCheckedStorageKey,
    JSON.stringify(checkedItems)
  );
}

export function clearCheckedGroceryItems() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(groceryCheckedStorageKey);
}
