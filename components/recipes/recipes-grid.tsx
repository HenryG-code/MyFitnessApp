"use client";

import { RecipeCard } from "@/components/recipes/recipe-card";
import {
  toggleFavoriteSlug,
  useFavoriteRecipes,
} from "@/src/lib/recipes/favorites";
import {
  filterRecipes,
  goalFilterOptions,
  mealTypeOptions,
  prepTimeFilterOptions,
  proteinFilterOptions,
  type Recipe,
  type RecipeFilters,
} from "@/src/lib/recipes/data";
import { ChevronDown, Heart } from "lucide-react";
import { useMemo, useState } from "react";

type RecipesGridProps = {
  recipes: Recipe[];
};

const initialFilters: RecipeFilters = {
  mealType: "",
  goal: "",
  prepTime: "",
  protein: "",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`lf-press shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
        active
          ? "border-accent/50 bg-accent/15 text-accent-strong"
          : "border-line bg-white/[0.03] text-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function RecipesGrid({ recipes }: RecipesGridProps) {
  const [filters, setFilters] = useState<RecipeFilters>(initialFilters);
  const [savedOnly, setSavedOnly] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const favorites = useFavoriteRecipes();

  const filteredRecipes = useMemo(() => {
    const base = filterRecipes(recipes, filters);
    return savedOnly ? base.filter((recipe) => favorites.has(recipe.slug)) : base;
  }, [recipes, filters, savedOnly, favorites]);

  const hasActiveFilter = Object.values(filters).some(Boolean) || savedOnly;

  return (
    <div className="space-y-3">
      {/* Meal-type chips + saved toggle */}
      <div
        className="lf-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Meal type filter"
      >
        <Chip
          active={!filters.mealType && !savedOnly}
          onClick={() => {
            setFilters((current) => ({ ...current, mealType: "" }));
            setSavedOnly(false);
          }}
        >
          All
        </Chip>
        {mealTypeOptions.map((option) => (
          <Chip
            key={option}
            active={filters.mealType === option}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                mealType: current.mealType === option ? "" : option,
              }))
            }
          >
            {option}
          </Chip>
        ))}
        <Chip active={savedOnly} onClick={() => setSavedOnly((v) => !v)}>
          <span className="flex items-center gap-1.5">
            <Heart
              className={`size-3 ${savedOnly ? "fill-accent-strong" : ""}`}
            />
            Saved{favorites.size ? ` · ${favorites.size}` : ""}
          </span>
        </Chip>
      </div>

      {/* Goal chips */}
      <div
        className="lf-scroll-x -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Goal filter"
      >
        {goalFilterOptions.map((option) => (
          <Chip
            key={option}
            active={filters.goal === option}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                goal: current.goal === option ? "" : option,
              }))
            }
          >
            {option}
          </Chip>
        ))}
        <button
          type="button"
          onClick={() => setShowMore((current) => !current)}
          aria-expanded={showMore}
          className="lf-press flex shrink-0 items-center gap-1 rounded-full px-2.5 py-2 text-xs font-bold text-ink-dim transition hover:text-foreground"
        >
          More
          <ChevronDown
            className={`size-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {showMore ? (
        <div className="lf-fade grid grid-cols-2 gap-2">
          <label className="text-xs font-bold text-muted">
            Prep time
            <select
              value={filters.prepTime}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  prepTime: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-accent"
            >
              <option value="">Any</option>
              {prepTimeFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-muted">
            Protein
            <select
              value={filters.protein}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  protein: event.target.value,
                }))
              }
              className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-accent"
            >
              <option value="">Any</option>
              {proteinFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {/* Result meta */}
      <div className="flex items-center justify-between px-1">
        <p className="lf-num text-[0.7rem] font-bold text-ink-dim">
          {filteredRecipes.length} of {recipes.length} recipes
        </p>
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              setSavedOnly(false);
            }}
            className="lf-press py-1 text-[0.7rem] font-bold text-muted transition hover:text-foreground"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filteredRecipes.length ? (
        <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.slug}
              recipe={recipe}
              isFavorite={favorites.has(recipe.slug)}
              onToggleFavorite={toggleFavoriteSlug}
            />
          ))}
        </section>
      ) : (
        <section className="lf-panel p-6 text-center">
          <p className="font-display text-lg font-black">
            {savedOnly && !favorites.size
              ? "No saved recipes yet"
              : "No recipes match those filters"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            {savedOnly && !favorites.size
              ? "Tap the heart on any recipe to save it here."
              : "Try clearing a filter or widening the protein or prep-time target."}
          </p>
        </section>
      )}
    </div>
  );
}
