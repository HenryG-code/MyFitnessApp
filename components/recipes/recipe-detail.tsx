import { FitnessCard, MetricCard } from "@/components/ui/fitness-card";
import type { Recipe } from "@/src/lib/recipes/data";
import {
  ArrowLeft,
  ChefHat,
  Clock,
  Flame,
  Gauge,
  Salad,
  Timer,
  Utensils,
} from "lucide-react";
import Link from "next/link";

type RecipeDetailProps = {
  recipe: Recipe;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="space-y-5">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
      >
        <ArrowLeft className="size-4" />
        Back to recipes
      </Link>

      <section className="overflow-hidden rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
            {recipe.mealType} / {recipe.difficulty}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            {recipe.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            {recipe.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {recipe.goals.map((goal) => (
              <span
                key={goal}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-white"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Calories"
          value={`${recipe.calories}`}
          detail="Approximate energy per serving."
          icon={<Flame className="size-5" />}
          tone="teal"
        />
        <MetricCard
          label="Protein"
          value={`${recipe.protein}g`}
          detail={`${recipe.carbs}g carbs / ${recipe.fat}g fat.`}
          icon={<Utensils className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Prep and cook"
          value={`${recipe.prepTimeMinutes + recipe.cookTimeMinutes} min`}
          detail={`${recipe.prepTimeMinutes} min prep / ${recipe.cookTimeMinutes} min cook.`}
          icon={<Timer className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Difficulty"
          value={recipe.difficulty}
          detail="Simple enough for repeat meals."
          icon={<Gauge className="size-5" />}
          tone="teal"
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <FitnessCard>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
              <Salad className="size-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                Ingredients
              </p>
              <h2 className="font-display text-xl font-black">
                What you need
              </h2>
            </div>
          </div>
          <ul className="space-y-3">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient}
                className="rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm font-bold text-muted"
              >
                {ingredient}
              </li>
            ))}
          </ul>
        </FitnessCard>

        <FitnessCard>
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-sun text-stone-950">
              <ChefHat className="size-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
                Instructions
              </p>
              <h2 className="font-display text-xl font-black">Make it</h2>
            </div>
          </div>
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li
                key={instruction}
                className="flex gap-3 rounded-2xl border border-line bg-white/65 p-4"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-stone-950 text-sm font-black text-white">
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-6 text-muted">
                  {instruction}
                </span>
              </li>
            ))}
          </ol>
        </FitnessCard>
      </section>

      <FitnessCard className="bg-[#eaf3dd]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent-strong">
              Coming later
            </p>
            <h2 className="mt-1 font-display text-xl font-black">
              Meal planner support coming soon.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-2 text-sm font-black text-muted">
            <Clock className="size-4" />
            Static recipes for v1
          </span>
        </div>
      </FitnessCard>
    </div>
  );
}
