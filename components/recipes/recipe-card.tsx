"use client";

import type { Recipe } from "@/src/lib/recipes/types";
import { Clock, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type RecipeCardProps = {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
};

const mealTypeTints: Record<Recipe["mealType"], string> = {
  Breakfast: "text-sun",
  Lunch: "text-ready",
  Dinner: "text-accent-strong",
  Snack: "text-caution",
};

export function RecipeCard({
  recipe,
  isFavorite,
  onToggleFavorite,
}: RecipeCardProps) {
  return (
    <div className="lf-panel lf-press group relative flex h-full flex-col p-3.5 transition hover:border-accent/30 sm:p-4">
      <button
        type="button"
        onClick={() => onToggleFavorite(recipe.slug)}
        aria-label={
          isFavorite
            ? `Remove ${recipe.title} from saved`
            : `Save ${recipe.title}`
        }
        aria-pressed={isFavorite}
        className="lf-press absolute right-2.5 top-2.5 z-10 grid size-9 place-items-center rounded-lg text-muted transition hover:text-foreground"
      >
        <Heart
          className={`size-4 transition ${isFavorite ? "fill-accent text-accent" : ""}`}
        />
      </button>

      <Link
        href={`/recipes/${recipe.slug}`}
        className="flex h-full flex-col outline-none"
      >
        {recipe.image ? (
          <span className="relative -mx-3.5 -mt-3.5 mb-3 block aspect-[2/1] overflow-hidden rounded-t-[1.2rem] sm:-mx-4 sm:-mt-4">
            <Image
              src={recipe.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </span>
        ) : null}
        <p
          className={`text-[0.6rem] font-black uppercase tracking-[0.16em] ${mealTypeTints[recipe.mealType]}`}
        >
          {recipe.mealType}
        </p>
        <h2 className="mt-1 pr-7 font-display text-[0.95rem] font-black leading-snug tracking-tight sm:text-lg">
          {recipe.title}
        </h2>

        <div className="mt-auto pt-3">
          <p className="flex items-baseline gap-2">
            <span className="lf-num font-display text-lg font-black text-foreground">
              {recipe.protein}g
              <span className="ml-0.5 text-[0.6rem] font-bold text-muted">
                protein
              </span>
            </span>
            <span className="lf-num text-xs font-bold text-muted">
              {recipe.calories} kcal
            </span>
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.65rem] font-bold text-ink-dim">
            <Clock className="size-3" />
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} min ·{" "}
            {recipe.difficulty}
            {recipe.goals[0] ? ` · ${recipe.goals[0]}` : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}
