export const groceryCategories = [
  "Protein",
  "Vegetables",
  "Fruit",
  "Carbs",
  "Dairy",
  "Pantry",
  "Fats & Oils",
  "Spices",
  "Other",
] as const;

export type GroceryCategory = (typeof groceryCategories)[number];

export type GroceryItem = {
  id: string;
  name: string;
  normalizedName: string;
  category: GroceryCategory;
  recipeSlugs: string[];
  recipeTitles: string[];
  count: number;
};

export type GroceryListState = Record<GroceryCategory, GroceryItem[]>;

export type CheckedGroceryItems = Record<string, boolean>;

export type GrocerySummary = {
  plannedMealsCount: number;
  uniqueIngredientsCount: number;
  checkedItemsCount: number;
  remainingItemsCount: number;
};
