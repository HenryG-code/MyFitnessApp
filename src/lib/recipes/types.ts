export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type Difficulty = "Easy" | "Medium";

export type Recipe = {
  slug: string;
  title: string;
  mealType: MealType;
  goals: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  description: string;
  tags: string[];
  /** Optional thumbnail path (e.g. /recipes/slug.jpg in public/). */
  image?: string;
};

export type RecipeFilters = {
  mealType: MealType | "";
  goal: string;
  prepTime: string;
  protein: string;
};

// Types, filter options, and pure helpers live here (not in data.ts) so
// client bundles that don't render the catalog skip the full recipe list.
export const mealTypeOptions: MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

export const goalFilterOptions = [
  "Fat loss",
  "Muscle gain",
  "Get fit",
  "Meal prep",
  "Budget",
  "High protein",
  "Quick",
];

export const prepTimeFilterOptions = [
  "Under 10 min",
  "Under 20 min",
  "Under 30 min",
  "Meal prep",
];

export const proteinFilterOptions = ["20g+", "30g+", "40g+"];

export function filterRecipes(recipeList: Recipe[], filters: RecipeFilters) {
  return recipeList.filter((recipe) => {
    if (filters.mealType && recipe.mealType !== filters.mealType) {
      return false;
    }

    if (filters.goal && !recipe.goals.includes(filters.goal)) {
      return false;
    }

    if (filters.prepTime === "Under 10 min" && recipe.prepTimeMinutes > 10) {
      return false;
    }

    if (filters.prepTime === "Under 20 min" && recipe.prepTimeMinutes > 20) {
      return false;
    }

    if (filters.prepTime === "Under 30 min" && recipe.prepTimeMinutes > 30) {
      return false;
    }

    if (
      filters.prepTime === "Meal prep" &&
      !recipe.goals.includes("Meal prep")
    ) {
      return false;
    }

    if (filters.protein === "20g+" && recipe.protein < 20) {
      return false;
    }

    if (filters.protein === "30g+" && recipe.protein < 30) {
      return false;
    }

    if (filters.protein === "40g+" && recipe.protein < 40) {
      return false;
    }

    return true;
  });
}
