import { RecipesGrid } from "@/components/recipes/recipes-grid";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { BookOpen, CalendarDays, Flame, Salad, Utensils } from "lucide-react";
import Link from "next/link";

export default function RecipesPage() {
  const recipes = getAllRecipes();

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
            Healthy recipes
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            Healthy recipes
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Balanced meals for fat loss, muscle gain, and getting fit.
          </p>
          <Link
            href="/meal-planner"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sun px-4 py-2 text-sm font-black text-stone-950 transition hover:-translate-y-0.5"
          >
            <CalendarDays className="size-4" />
            Plan your week
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <BookOpen className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">{recipes.length}</p>
            <p className="text-sm text-stone-300">Local recipes</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <Utensils className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">4</p>
            <p className="text-sm text-stone-300">Meal types</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <Flame className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">No APIs</p>
            <p className="text-sm text-stone-300">Static v1 data</p>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
              Fitness food
            </p>
            <h2 className="mt-1 font-display text-2xl font-black">
              Choose the meal that fits the day.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Filter by meal type, goal, prep speed, and protein target. Recipes
              stay local for now so the feature remains fast, private, and
              free-tier friendly.
            </p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl bg-[#eaf3dd] text-accent-strong">
            <Salad className="size-6" />
          </span>
        </div>
      </section>

      <RecipesGrid recipes={recipes} />
    </div>
  );
}
