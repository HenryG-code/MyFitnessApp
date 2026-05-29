import { FitnessCard } from "@/components/ui/fitness-card";
import type { Recipe } from "@/src/lib/recipes/data";
import { Clock, Flame, Utensils } from "lucide-react";
import Link from "next/link";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <FitnessCard className="group flex h-full flex-col overflow-hidden hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(23,33,28,0.14)]">
      <div className="-mx-5 -mt-5 mb-5 h-2 bg-gradient-to-r from-accent via-sun to-accent-strong opacity-90 transition group-hover:h-3" />
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-[#eaf3dd] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-accent-strong">
          {recipe.mealType}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-black text-muted">
          <Clock className="size-3.5" />
          {recipe.prepTimeMinutes} min prep
        </span>
      </div>

      <h2 className="mt-5 font-display text-2xl font-black tracking-tight">
        {recipe.title}
      </h2>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
        {recipe.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line/60 bg-white/70 p-3 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
            <Flame className="size-4 text-accent" />
            Calories
          </p>
          <p className="mt-2 text-xl font-black">{recipe.calories}</p>
        </div>
        <div className="rounded-2xl border border-line/60 bg-white/70 p-3 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-muted">
            <Utensils className="size-4 text-accent" />
            Protein
          </p>
          <p className="mt-2 text-xl font-black">{recipe.protein}g</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {recipe.goals.slice(0, 3).map((goal) => (
          <span
            key={goal}
            className="rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-bold text-muted"
          >
            {goal}
          </span>
        ))}
      </div>

      <Link
        href={`/recipes/${recipe.slug}`}
        className="mt-6 inline-flex items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent"
      >
        View recipe
      </Link>
    </FitnessCard>
  );
}
