"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeFiltersPanel } from "@/components/recipes/recipe-filters";
import {
  filterRecipes,
  type Recipe,
  type RecipeFilters,
} from "@/src/lib/recipes/data";
import { SearchX } from "lucide-react";
import { useState } from "react";

type RecipesGridProps = {
  recipes: Recipe[];
};

const initialFilters: RecipeFilters = {
  mealType: "",
  goal: "",
  prepTime: "",
  protein: "",
};

export function RecipesGrid({ recipes }: RecipesGridProps) {
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const filteredRecipes = filterRecipes(recipes, filters);

  return (
    <div className="space-y-5">
      <RecipeFiltersPanel filters={filters} onChange={setFilters} />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-muted">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </p>
      </div>

      {filteredRecipes.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-line/80 bg-card/85 p-8 text-center shadow-[0_20px_60px_rgba(23,33,28,0.08)]">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-stone-950 text-white">
            <SearchX className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-black">
            No recipes match those filters.
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted">
            Try clearing one filter or widening the protein or prep-time
            target.
          </p>
        </section>
      )}
    </div>
  );
}
