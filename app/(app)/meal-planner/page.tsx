import { MealPlanner } from "@/components/meal-planner/meal-planner";
import { HeroPanel } from "@/components/ui/hero-panel";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { CalendarDays, ChefHat, ShoppingBasket, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MealPlannerPage() {
  const recipes = getAllRecipes();

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Meal planner"
        title="Weekly meal planner"
        description="Plan balanced meals from your healthy recipe library."
        imageSrc={fitnessImages.fitnessCommunity}
        imageAlt="Fitness community planning a healthy week"
        variant="default"
      >
          <Link
            href="/grocery-list"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-sun px-4 py-2 text-sm font-black text-stone-950 transition hover:-translate-y-0.5"
          >
            <ShoppingBasket className="size-4" />
            Generate grocery list
          </Link>

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
            <Sparkles className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Saved</p>
            <p className="text-sm text-stone-300">Available on this device</p>
          </div>
        </div>
      </HeroPanel>

      <MealPlanner recipes={recipes} />
    </div>
  );
}
