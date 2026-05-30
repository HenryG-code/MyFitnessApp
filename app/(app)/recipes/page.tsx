import { RecipesGrid } from "@/components/recipes/recipes-grid";
import { HeroPanel } from "@/components/ui/hero-panel";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import {
  BookOpen,
  CalendarDays,
  Flame,
  Salad,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import Link from "next/link";

export default function RecipesPage() {
  const recipes = getAllRecipes();

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Healthy recipes"
        title="Healthy recipes"
        description="Balanced meals for fat loss, muscle gain, and getting fit."
        imageSrc={fitnessImages.fitnessCommunity}
        imageAlt="Fitness community preparing for training"
        variant="default"
      >
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/meal-planner"
              className="inline-flex items-center gap-2 rounded-2xl bg-sun px-4 py-2 text-sm font-black text-stone-950 transition hover:-translate-y-0.5"
            >
              <CalendarDays className="size-4" />
              Plan your week
            </Link>
            <Link
              href="/grocery-list"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              <ShoppingBasket className="size-4" />
              Grocery list
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
            <p className="mt-3 text-2xl font-black">Goal ready</p>
            <p className="text-sm text-stone-300">Meals for training days</p>
          </div>
        </div>
      </HeroPanel>

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
              Filter meals by goal, meal type, protein, and prep time. Simple,
              practical meals for training, fat loss, and general health.
            </p>
          </div>
          <span className="grid size-14 place-items-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Salad className="size-6" />
          </span>
        </div>
      </section>

      <RecipesGrid recipes={recipes} />
    </div>
  );
}
