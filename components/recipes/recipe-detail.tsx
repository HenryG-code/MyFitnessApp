"use client";

import type { Recipe } from "@/src/lib/recipes/data";
import {
  toggleFavoriteSlug,
  useFavoriteRecipes,
} from "@/src/lib/recipes/favorites";
import { ArrowLeft, CalendarDays, Check, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type RecipeDetailProps = {
  recipe: Recipe;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const isFavorite = useFavoriteRecipes().has(recipe.slug);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(
    new Set()
  );

  function toggleIngredient(ingredient: string) {
    setCheckedIngredients((current) => {
      const next = new Set(current);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {/* Header */}
      <header className="lf-rise">
        <div className="flex items-center justify-between">
          <Link
            href="/recipes"
            className="lf-press flex items-center gap-1.5 py-1 text-xs font-bold text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Recipes
          </Link>
          <button
            type="button"
            onClick={() => toggleFavoriteSlug(recipe.slug)}
            aria-label={isFavorite ? "Remove from saved" : "Save recipe"}
            aria-pressed={isFavorite}
            className="lf-press grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:text-foreground"
          >
            <Heart
              className={`size-4 ${isFavorite ? "fill-accent text-accent" : ""}`}
            />
          </button>
        </div>
        <p className="lf-eyebrow mt-2 text-accent-strong">
          {recipe.mealType} · {recipe.difficulty}
        </p>
        <h1 className="mt-1 font-display text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {recipe.title}
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          {recipe.description}
        </p>
      </header>

      {recipe.image ? (
        <div className="lf-rise lf-rise-1 relative aspect-[2/1] overflow-hidden rounded-xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={recipe.image}
            alt={recipe.title}
            className="size-full object-cover"
          />
        </div>
      ) : null}

      {/* Nutrition strip */}
      <section className="lf-rise lf-rise-1 grid grid-cols-4 gap-2">
        {[
          { label: "Kcal", value: `${recipe.calories}` },
          { label: "Protein", value: `${recipe.protein}g` },
          { label: "Carbs", value: `${recipe.carbs}g` },
          { label: "Fat", value: `${recipe.fat}g` },
        ].map((stat) => (
          <div key={stat.label} className="lf-inset p-2.5 text-center sm:p-3">
            <p className="lf-num font-display text-base font-black sm:text-xl">
              {stat.value}
            </p>
            <p className="lf-eyebrow mt-0.5 !text-[0.56rem]">{stat.label}</p>
          </div>
        ))}
      </section>

      <p className="lf-rise lf-rise-1 px-1 text-[0.68rem] leading-snug text-ink-dim">
        Approximate nutrition per serving. Exact values vary with ingredient
        brands, trimming, and cooked weight.
      </p>

      <p className="lf-rise lf-rise-1 px-1 text-[0.7rem] font-bold text-ink-dim">
        {recipe.prepTimeMinutes} min prep
        {recipe.cookTimeMinutes ? ` · ${recipe.cookTimeMinutes} min cook` : ""} ·{" "}
        {recipe.goals.join(" · ")}
      </p>

      {/* Ingredients — tappable checklist */}
      <section className="lf-rise lf-rise-2 lf-panel p-4">
        <div className="flex items-baseline justify-between">
          <p className="lf-eyebrow">Ingredients</p>
          <p className="lf-num text-[0.65rem] font-bold text-ink-dim">
            {checkedIngredients.size}/{recipe.ingredients.length}
          </p>
        </div>
        <ul className="mt-2.5 space-y-1">
          {recipe.ingredients.map((ingredient) => {
            const checked = checkedIngredients.has(ingredient);

            return (
              <li key={ingredient}>
                <button
                  type="button"
                  onClick={() => toggleIngredient(ingredient)}
                  aria-pressed={checked}
                  className="lf-press flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white/[0.03]"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${
                      checked
                        ? "border-ready/50 bg-ready/15 text-ready"
                        : "border-line text-transparent"
                    }`}
                  >
                    <Check className="size-3" />
                  </span>
                  <span
                    className={`text-sm font-semibold transition ${
                      checked ? "text-ink-dim line-through" : "text-foreground"
                    }`}
                  >
                    {ingredient}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Steps */}
      <section className="lf-rise lf-rise-3 lf-panel p-4">
        <p className="lf-eyebrow">Method</p>
        <ol className="mt-2.5 space-y-3">
          {recipe.instructions.map((instruction, index) => (
            <li key={instruction} className="flex gap-3">
              <span className="lf-num grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-[0.7rem] font-black text-accent-strong">
                {index + 1}
              </span>
              <span className="pt-0.5 text-sm font-medium leading-relaxed text-muted">
                {instruction}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Quick action */}
      <Link
        href="/meal-planner"
        className="lf-rise lf-rise-4 lf-press flex h-12 items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/10 text-sm font-black text-accent-strong transition hover:bg-accent/[0.18]"
      >
        <CalendarDays className="size-4" />
        Add to weekly meal plan
      </Link>
    </div>
  );
}
