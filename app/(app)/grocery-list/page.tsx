import { GroceryList } from "@/components/grocery-list/grocery-list";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export default function GroceryListPage() {
  const recipes = getAllRecipes();

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <header className="lf-rise flex items-end justify-between gap-3">
        <div>
          <p className="lf-eyebrow">Grocery list</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            This week&apos;s shop
          </h1>
        </div>
        <Link
          href="/meal-planner"
          aria-label="Open meal planner"
          className="lf-press grid size-10 place-items-center rounded-xl border border-line bg-white/[0.04] text-muted transition hover:text-foreground"
        >
          <CalendarDays className="size-[1.05rem]" />
        </Link>
      </header>

      <div className="lf-rise lf-rise-1">
        <GroceryList recipes={recipes} />
      </div>
    </div>
  );
}
