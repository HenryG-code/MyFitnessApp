"use client";

import { DayCard } from "@/components/meal-planner/day-card";
import { MealPlannerSummary } from "@/components/meal-planner/meal-planner-summary";
import {
  calculateWeekTotals,
  createRecipeMap,
} from "@/src/lib/meal-planner/calculations";
import {
  clearMealPlanStorage,
  createEmptyMealPlan,
  loadMealPlanFromStorage,
  saveMealPlanToStorage,
} from "@/src/lib/meal-planner/storage";
import {
  weekdays,
  type MealPlanState,
  type MealSlot,
  type Weekday,
} from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";
import { CalendarDays, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

type MealPlannerProps = {
  recipes: Recipe[];
};

export function MealPlanner({ recipes }: MealPlannerProps) {
  const [plan, setPlan] = useState<MealPlanState>(() => createEmptyMealPlan());
  const [hasLoadedPlan, setHasLoadedPlan] = useState(false);
  const recipeMap = createRecipeMap(recipes);
  const totals = calculateWeekTotals(plan, recipeMap);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setPlan(loadMealPlanFromStorage());
      setHasLoadedPlan(true);
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (hasLoadedPlan) {
      saveMealPlanToStorage(plan);
    }
  }, [hasLoadedPlan, plan]);

  function updateSlot(day: Weekday, slot: MealSlot, slug: string | null) {
    setPlan((currentPlan) => ({
      ...currentPlan,
      [day]: {
        ...currentPlan[day],
        [slot]: slug,
      },
    }));
  }

  function clearWeek() {
    const confirmed = window.confirm("Clear every planned meal this week?");

    if (!confirmed) {
      return;
    }

    const emptyPlan = createEmptyMealPlan();
    setPlan(emptyPlan);
    clearMealPlanStorage();
  }

  return (
    <div className="space-y-5">
      <MealPlannerSummary totals={totals} />

      {totals.plannedMealsCount === 0 ? (
        <section className="rounded-[1.75rem] border border-line/80 bg-[#eaf3dd] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-accent-strong">
                Empty week
              </p>
              <h2 className="mt-1 font-display text-2xl font-black">
                Start by choosing a recipe for Monday breakfast.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Your picks save to this browser automatically with localStorage.
              </p>
            </div>
            <span className="grid size-14 place-items-center rounded-2xl bg-white/75 text-accent-strong">
              <CalendarDays className="size-6" />
            </span>
          </div>
        </section>
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearWeek}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:-translate-y-0.5"
          >
            <RotateCcw className="size-4" />
            Clear week
          </button>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        {weekdays.map((day) => (
          <DayCard
            key={day}
            day={day}
            plan={plan}
            recipes={recipes}
            recipeMap={recipeMap}
            onSlotChange={updateSlot}
          />
        ))}
      </section>
    </div>
  );
}
