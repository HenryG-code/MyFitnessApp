import type { MealSlot } from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";
import { ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

type MealSlotCardProps = {
  slot: MealSlot;
  selectedRecipe: Recipe | null;
  selectedSlug: string | null;
  recipes: Recipe[];
  onChange: (slug: string | null) => void;
};

function getRecipeOptions(slot: MealSlot, recipes: Recipe[]) {
  const slotRecipes = recipes.filter((recipe) => recipe.mealType === slot);
  const otherRecipes = recipes.filter((recipe) => recipe.mealType !== slot);

  return { slotRecipes, otherRecipes };
}

export function MealSlotCard({
  slot,
  selectedRecipe,
  selectedSlug,
  recipes,
  onChange,
}: MealSlotCardProps) {
  const { slotRecipes, otherRecipes } = getRecipeOptions(slot, recipes);
  const hasInvalidSelection = Boolean(selectedSlug && !selectedRecipe);

  return (
    <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            {slot}
          </p>
          {selectedRecipe ? (
            <h3 className="mt-2 font-display text-lg font-black">
              {selectedRecipe.title}
            </h3>
          ) : (
            <h3 className="mt-2 font-display text-lg font-black">
              Choose a recipe
            </h3>
          )}
        </div>

        {selectedSlug ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="grid size-9 place-items-center rounded-xl bg-red-50 text-red-700 transition hover:-translate-y-0.5"
            aria-label={`Clear ${slot}`}
          >
            <Trash2 className="size-4" />
          </button>
        ) : null}
      </div>

      <select
        value={selectedSlug ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        className="mt-4 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
      >
        <option value="">Select {slot.toLowerCase()}</option>
        {slotRecipes.length ? (
          <optgroup label={`${slot} recipes`}>
            {slotRecipes.map((recipe) => (
              <option key={recipe.slug} value={recipe.slug}>
                {recipe.title}
              </option>
            ))}
          </optgroup>
        ) : (
          <option disabled>No matching recipes found.</option>
        )}
        {otherRecipes.length ? (
          <optgroup label="Any recipe">
            {otherRecipes.map((recipe) => (
              <option key={recipe.slug} value={recipe.slug}>
                {recipe.title} ({recipe.mealType})
              </option>
            ))}
          </optgroup>
        ) : null}
      </select>

      {selectedRecipe ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-stone-100 px-2 py-2">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
                Calories
              </p>
              <p className="text-sm font-black">{selectedRecipe.calories}</p>
            </div>
            <div className="rounded-xl bg-stone-100 px-2 py-2">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
                Protein
              </p>
              <p className="text-sm font-black">{selectedRecipe.protein}g</p>
            </div>
            <div className="rounded-xl bg-stone-100 px-2 py-2">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.12em] text-muted">
                Type
              </p>
              <p className="text-sm font-black">{selectedRecipe.mealType}</p>
            </div>
          </div>
          <Link
            href={`/recipes/${selectedRecipe.slug}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
          >
            View recipe
            <ExternalLink className="size-4" />
          </Link>
        </div>
      ) : null}

      {hasInvalidSelection ? (
        <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
          This saved recipe is no longer available. Clear the slot to choose a
          new recipe.
        </p>
      ) : null}
    </div>
  );
}
