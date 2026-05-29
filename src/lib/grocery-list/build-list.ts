import {
  categorizeIngredient,
  createGroceryItemId,
  normalizeIngredientName,
} from "@/src/lib/grocery-list/categories";
import {
  groceryCategories,
  type CheckedGroceryItems,
  type GroceryItem,
  type GroceryListState,
  type GrocerySummary,
} from "@/src/lib/grocery-list/types";
import { mealSlots, weekdays, type MealPlanState } from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";

function createEmptyGroceryList(): GroceryListState {
  return groceryCategories.reduce((list, category) => {
    list[category] = [];
    return list;
  }, {} as GroceryListState);
}

export function getSelectedRecipeSlugs(plan: MealPlanState) {
  return weekdays.flatMap((day) =>
    mealSlots.flatMap((slot) => {
      const slug = plan[day][slot];
      return slug ? [slug] : [];
    })
  );
}

export function buildGroceryList(
  plan: MealPlanState,
  recipes: Recipe[]
): GroceryListState {
  const recipesBySlug = new Map(recipes.map((recipe) => [recipe.slug, recipe]));
  const itemsById = new Map<string, GroceryItem>();

  getSelectedRecipeSlugs(plan).forEach((slug) => {
    const recipe = recipesBySlug.get(slug);

    if (!recipe) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      const normalizedName = normalizeIngredientName(ingredient);
      const category = categorizeIngredient(ingredient);
      const id = createGroceryItemId(category, normalizedName);
      const existingItem = itemsById.get(id);

      if (existingItem) {
        if (!existingItem.recipeSlugs.includes(recipe.slug)) {
          existingItem.recipeSlugs.push(recipe.slug);
          existingItem.recipeTitles.push(recipe.title);
          existingItem.count = existingItem.recipeSlugs.length;
        }

        return;
      }

      itemsById.set(id, {
        id,
        name: ingredient,
        normalizedName,
        category,
        recipeSlugs: [recipe.slug],
        recipeTitles: [recipe.title],
        count: 1,
      });
    });
  });

  const groceryList = createEmptyGroceryList();

  Array.from(itemsById.values())
    .sort((first, second) => first.name.localeCompare(second.name))
    .forEach((item) => {
      groceryList[item.category].push(item);
    });

  return groceryList;
}

export function flattenGroceryList(groceryList: GroceryListState) {
  return groceryCategories.flatMap((category) => groceryList[category]);
}

export function calculateGrocerySummary(
  groceryList: GroceryListState,
  checkedItems: CheckedGroceryItems,
  plannedMealsCount: number
): GrocerySummary {
  const groceryItems = flattenGroceryList(groceryList);
  const checkedItemsCount = groceryItems.filter((item) => checkedItems[item.id])
    .length;

  return {
    plannedMealsCount,
    uniqueIngredientsCount: groceryItems.length,
    checkedItemsCount,
    remainingItemsCount: groceryItems.length - checkedItemsCount,
  };
}
