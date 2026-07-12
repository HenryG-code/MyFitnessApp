import { describe, expect, it } from "vitest";
import { filterRecipes, type Recipe, type RecipeFilters } from "./types";

function recipe(overrides: Partial<Recipe>): Recipe {
  return {
    slug: "test-recipe",
    title: "Test Recipe",
    mealType: "Lunch",
    goals: [],
    calories: 500,
    protein: 30,
    carbs: 50,
    fat: 15,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    difficulty: "Easy",
    ingredients: [],
    instructions: [],
    description: "",
    tags: [],
    ...overrides,
  };
}

const noFilters: RecipeFilters = {
  mealType: "",
  goal: "",
  prepTime: "",
  protein: "",
};

describe("filterRecipes", () => {
  it("returns everything when no filters are set", () => {
    const list = [recipe({ slug: "a" }), recipe({ slug: "b" })];

    expect(filterRecipes(list, noFilters)).toHaveLength(2);
  });

  it("filters by meal type", () => {
    const list = [
      recipe({ slug: "a", mealType: "Breakfast" }),
      recipe({ slug: "b", mealType: "Dinner" }),
    ];
    const result = filterRecipes(list, { ...noFilters, mealType: "Dinner" });

    expect(result.map((item) => item.slug)).toEqual(["b"]);
  });

  it("filters by goal", () => {
    const list = [
      recipe({ slug: "a", goals: ["Fat loss"] }),
      recipe({ slug: "b", goals: ["Muscle gain"] }),
    ];
    const result = filterRecipes(list, { ...noFilters, goal: "Fat loss" });

    expect(result.map((item) => item.slug)).toEqual(["a"]);
  });

  it("applies prep-time bands inclusively", () => {
    const list = [
      recipe({ slug: "fast", prepTimeMinutes: 10 }),
      recipe({ slug: "slow", prepTimeMinutes: 25 }),
    ];
    const result = filterRecipes(list, {
      ...noFilters,
      prepTime: "Under 10 min",
    });

    expect(result.map((item) => item.slug)).toEqual(["fast"]);
  });

  it("treats the Meal prep option as a goal filter", () => {
    const list = [
      recipe({ slug: "prep", goals: ["Meal prep"] }),
      recipe({ slug: "other", goals: ["Quick"] }),
    ];
    const result = filterRecipes(list, { ...noFilters, prepTime: "Meal prep" });

    expect(result.map((item) => item.slug)).toEqual(["prep"]);
  });

  it("applies protein thresholds inclusively", () => {
    const list = [
      recipe({ slug: "low", protein: 19 }),
      recipe({ slug: "exact", protein: 20 }),
      recipe({ slug: "high", protein: 45 }),
    ];
    const result = filterRecipes(list, { ...noFilters, protein: "20g+" });

    expect(result.map((item) => item.slug)).toEqual(["exact", "high"]);
  });

  it("combines filters with AND semantics", () => {
    const list = [
      recipe({
        slug: "match",
        mealType: "Dinner",
        goals: ["High protein"],
        protein: 42,
      }),
      recipe({
        slug: "wrong-meal",
        mealType: "Lunch",
        goals: ["High protein"],
        protein: 42,
      }),
    ];
    const result = filterRecipes(list, {
      ...noFilters,
      mealType: "Dinner",
      goal: "High protein",
      protein: "40g+",
    });

    expect(result.map((item) => item.slug)).toEqual(["match"]);
  });
});
