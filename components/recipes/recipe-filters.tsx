"use client";

import {
  goalFilterOptions,
  mealTypeOptions,
  prepTimeFilterOptions,
  proteinFilterOptions,
  type RecipeFilters,
} from "@/src/lib/recipes/data";
import { SlidersHorizontal, X } from "lucide-react";

type RecipeFiltersProps = {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
};

function updateFilter(
  filters: RecipeFilters,
  key: keyof RecipeFilters,
  value: string
) {
  return {
    ...filters,
    [key]: value,
  };
}

export function RecipeFiltersPanel({
  filters,
  onChange,
}: RecipeFiltersProps) {
  const hasActiveFilter = Object.values(filters).some(Boolean);

  return (
    <section className="rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent text-white">
            <SlidersHorizontal className="size-5" />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
              Filters
            </p>
            <h2 className="font-display text-xl font-black">
              Find your next meal
            </h2>
          </div>
        </div>

        {hasActiveFilter ? (
          <button
            type="button"
            onClick={() =>
              onChange({ mealType: "", goal: "", prepTime: "", protein: "" })
            }
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
          >
            <X className="size-4" />
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-black">
          Meal type
          <select
            value={filters.mealType}
            onChange={(event) =>
              onChange(updateFilter(filters, "mealType", event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 font-medium outline-none transition focus:border-accent focus:ring-4 focus:ring-yellow-400/10"
          >
            <option value="">All meals</option>
            {mealTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-black">
          Goal
          <select
            value={filters.goal}
            onChange={(event) =>
              onChange(updateFilter(filters, "goal", event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 font-medium outline-none transition focus:border-accent focus:ring-4 focus:ring-yellow-400/10"
          >
            <option value="">All goals</option>
            {goalFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-black">
          Prep time
          <select
            value={filters.prepTime}
            onChange={(event) =>
              onChange(updateFilter(filters, "prepTime", event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 font-medium outline-none transition focus:border-accent focus:ring-4 focus:ring-yellow-400/10"
          >
            <option value="">Any prep time</option>
            {prepTimeFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-black">
          Protein
          <select
            value={filters.protein}
            onChange={(event) =>
              onChange(updateFilter(filters, "protein", event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-line bg-surface/80 px-4 py-3 font-medium outline-none transition focus:border-accent focus:ring-4 focus:ring-yellow-400/10"
          >
            <option value="">Any protein</option>
            {proteinFilterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
