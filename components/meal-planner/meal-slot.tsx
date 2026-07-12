"use client";

import type { MealSlot } from "@/src/lib/meal-planner/types";
import { mealTypeOptions, type Recipe } from "@/src/lib/recipes/types";
import { ChevronRight, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type MealSlotCardProps = {
  slot: MealSlot;
  selectedRecipe: Recipe | null;
  selectedSlug: string | null;
  recipes: Recipe[];
  onChange: (slug: string | null) => void;
};

const mealTypeTints: Record<Recipe["mealType"], string> = {
  Breakfast: "text-sun",
  Lunch: "text-ready",
  Dinner: "text-accent-strong",
  Snack: "text-caution",
};

/** Bottom-sheet recipe picker with meal-type chips and compact rows. */
function RecipePickerSheet({
  slot,
  recipes,
  onSelect,
  onClose,
}: {
  slot: MealSlot;
  recipes: Recipe[];
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  const [mealType, setMealType] = useState<Recipe["mealType"] | "">(slot);

  const visibleRecipes = useMemo(() => {
    const filtered = mealType
      ? recipes.filter((recipe) => recipe.mealType === mealType)
      : recipes;
    return [...filtered].sort((a, b) => b.protein - a.protein);
  }, [recipes, mealType]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label={`Choose a ${slot.toLowerCase()} recipe`}
      onClick={onClose}
    >
      <div
        className="lf-sheet flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-2xl border-t border-line bg-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 pb-2">
          <p className="lf-eyebrow">Choose {slot.toLowerCase()}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close picker"
            className="lf-press grid size-9 place-items-center rounded-xl border border-line text-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="lf-scroll-x flex gap-2 overflow-x-auto px-4 pb-3">
          {(["", ...mealTypeOptions] as Array<Recipe["mealType"] | "">).map(
            (option) => (
              <button
                key={option || "all"}
                type="button"
                onClick={() => setMealType(option)}
                aria-pressed={mealType === option}
                className={`lf-press shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  mealType === option
                    ? "border-accent/50 bg-accent/15 text-accent-strong"
                    : "border-line bg-white/[0.03] text-muted"
                }`}
              >
                {option || "All"}
              </button>
            )
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {visibleRecipes.length ? (
            <ul className="space-y-1">
              {visibleRecipes.map((recipe) => (
                <li key={recipe.slug}>
                  <button
                    type="button"
                    onClick={() => onSelect(recipe.slug)}
                    className="lf-press flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-white/[0.04]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {recipe.title}
                      </span>
                      <span
                        className={`text-[0.62rem] font-black uppercase tracking-wider ${mealTypeTints[recipe.mealType]}`}
                      >
                        {recipe.mealType}
                      </span>
                    </span>
                    <span className="lf-num shrink-0 text-right text-xs font-bold text-muted">
                      {recipe.protein}g · {recipe.calories} kcal
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-ink-dim" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-center text-sm font-semibold text-muted">
              No recipes for this filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MealSlotCard({
  slot,
  selectedRecipe,
  selectedSlug,
  recipes,
  onChange,
}: MealSlotCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasInvalidSelection = Boolean(selectedSlug && !selectedRecipe);

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        selectedRecipe
          ? "border-accent/30 bg-accent/[0.08]"
          : "border-line bg-white/[0.03]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="lf-eyebrow !text-[0.6rem]">{slot}</p>
        {selectedSlug ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Clear ${slot}`}
            className="lf-press grid size-7 place-items-center rounded-md text-ink-dim transition hover:text-strain"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {selectedRecipe ? (
        <div className="mt-1.5">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="lf-press min-w-0 flex-1 text-left"
              aria-label={`Change ${slot.toLowerCase()} recipe`}
            >
              <p className="truncate font-display text-sm font-black leading-tight">
                {selectedRecipe.title}
              </p>
              <p className="lf-num mt-0.5 text-[0.68rem] font-bold text-muted">
                {selectedRecipe.protein}g protein · {selectedRecipe.calories}{" "}
                kcal
              </p>
            </button>
            <Link
              href={`/recipes/${selectedRecipe.slug}`}
              aria-label={`View ${selectedRecipe.title}`}
              className="lf-press grid size-8 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="lf-press mt-1.5 flex w-full items-center justify-between rounded-lg border border-dashed border-line px-3 py-2.5 text-sm font-bold text-muted transition hover:border-accent/40 hover:text-foreground"
        >
          Choose a recipe
          <ChevronRight className="size-4" />
        </button>
      )}

      {hasInvalidSelection ? (
        <p className="mt-2 rounded-lg border border-strain/25 bg-strain/10 p-2 text-xs font-bold text-strain">
          This saved recipe is no longer available. Clear the slot to pick a
          new one.
        </p>
      ) : null}

      {pickerOpen ? (
        <RecipePickerSheet
          slot={slot}
          recipes={recipes}
          onSelect={(slug) => {
            onChange(slug);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </div>
  );
}
