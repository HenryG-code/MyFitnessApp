import { MealPlanner } from "@/components/meal-planner/meal-planner";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { CalendarDays, ChefHat, DatabaseZap } from "lucide-react";

export default function MealPlannerPage() {
  const recipes = getAllRecipes();

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
            Meal planner
          </p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-6xl">
            Weekly meal planner
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
            Plan balanced meals from your healthy recipe library.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <CalendarDays className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">7 days</p>
            <p className="text-sm text-stone-300">Breakfast to snacks</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <ChefHat className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">{recipes.length}</p>
            <p className="text-sm text-stone-300">Recipe options</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <DatabaseZap className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Local</p>
            <p className="text-sm text-stone-300">Saved in this browser</p>
          </div>
        </div>
      </section>

      <MealPlanner recipes={recipes} />
    </div>
  );
}
