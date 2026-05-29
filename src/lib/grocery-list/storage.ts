import type { CheckedGroceryItems } from "@/src/lib/grocery-list/types";

export const groceryCheckedStorageKey = "liftlog-grocery-list-checked-v1";

function isCheckedGroceryItems(value: unknown): value is CheckedGroceryItems {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "boolean");
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
