"use client";

import { GroceryCategorySection } from "@/components/grocery-list/grocery-category-section";
import { GrocerySummary } from "@/components/grocery-list/grocery-summary";
import { FitnessCard } from "@/components/ui/fitness-card";
import {
  buildGroceryList,
  calculateGrocerySummary,
  flattenGroceryList,
  getSelectedRecipeSlugs,
} from "@/src/lib/grocery-list/build-list";
import {
  clearCheckedGroceryItems,
  loadCheckedGroceryItems,
  saveCheckedGroceryItems,
} from "@/src/lib/grocery-list/storage";
import { groceryCategories, type CheckedGroceryItems } from "@/src/lib/grocery-list/types";
import {
  createEmptyMealPlan,
  loadMealPlanFromStorage,
} from "@/src/lib/meal-planner/storage";
import type { MealPlanState } from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";
import { CalendarDays, EyeOff, RotateCcw, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type GroceryListProps = {
  recipes: Recipe[];
};

export function GroceryList({ recipes }: GroceryListProps) {
  const [plan, setPlan] = useState<MealPlanState>(() => createEmptyMealPlan());
  const [checkedItems, setCheckedItems] = useState<CheckedGroceryItems>({});
  const [hideCheckedItems, setHideCheckedItems] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setPlan(loadMealPlanFromStorage());
      setCheckedItems(loadCheckedGroceryItems());
      setHasLoadedStorage(true);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (hasLoadedStorage) {
      saveCheckedGroceryItems(checkedItems);
    }
  }, [checkedItems, hasLoadedStorage]);

  const groceryList = buildGroceryList(plan, recipes);
  const plannedMealsCount = getSelectedRecipeSlugs(plan).length;
  const allGroceryItems = flattenGroceryList(groceryList);
  const summary = calculateGrocerySummary(
    groceryList,
    checkedItems,
    plannedMealsCount
  );

  function toggleItem(id: string, checked: boolean) {
    setCheckedItems((currentItems) => ({
      ...currentItems,
      [id]: checked,
    }));
  }

  function clearCheckedFromView() {
    if (!summary.checkedItemsCount) {
      return;
    }

    const confirmed = window.confirm("Hide checked grocery items from the list?");

    if (confirmed) {
      setHideCheckedItems(true);
    }
  }

  function resetCheckedItems() {
    if (!summary.checkedItemsCount) {
      return;
    }

    const confirmed = window.confirm("Reset all checked grocery items?");

    if (!confirmed) {
      return;
    }

    setCheckedItems({});
    setHideCheckedItems(false);
    clearCheckedGroceryItems();
  }

  if (hasLoadedStorage && plannedMealsCount === 0) {
    return (
      <FitnessCard>
        <div className="rounded-[1.5rem] bg-[#eaf3dd] p-6">
          <span className="grid size-14 place-items-center rounded-2xl bg-white/75 text-accent-strong">
            <ShoppingBasket className="size-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-black">
            No planned meals yet.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Add recipes to your Meal Planner first, then your grocery list will
            appear here.
          </p>
          <Link
            href="/meal-planner"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
          >
            <CalendarDays className="size-4" />
            Open Meal Planner
          </Link>
        </div>
      </FitnessCard>
    );
  }

  return (
    <div className="space-y-5">
      <GrocerySummary summary={summary} />

      <section className="flex flex-col gap-3 rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Shopping mode
          </p>
          <h2 className="mt-1 font-display text-2xl font-black">
            {allGroceryItems.length} ingredients from your plan
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Duplicate ingredients are combined and show how many planned meals
            use them.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {hideCheckedItems ? (
            <button
              type="button"
              onClick={() => setHideCheckedItems(false)}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-accent"
            >
              Show checked
            </button>
          ) : (
            <button
              type="button"
              onClick={clearCheckedFromView}
              disabled={!summary.checkedItemsCount}
              className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              <EyeOff className="size-4" />
              Clear checked items
            </button>
          )}
          <button
            type="button"
            onClick={resetCheckedItems}
            disabled={!summary.checkedItemsCount}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="size-4" />
            Reset all checked states
          </button>
          <Link
            href="/meal-planner"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#eaf3dd] px-4 py-3 text-sm font-black text-accent-strong transition hover:-translate-y-0.5"
          >
            <CalendarDays className="size-4" />
            Go to Meal Planner
          </Link>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {groceryCategories.map((category) => (
          <GroceryCategorySection
            key={category}
            category={category}
            items={groceryList[category]}
            checkedItems={checkedItems}
            hideCheckedItems={hideCheckedItems}
            onToggle={toggleItem}
          />
        ))}
      </div>
    </div>
  );
}
