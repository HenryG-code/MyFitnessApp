import { MealSlotCard } from "@/components/meal-planner/meal-slot";
import { FitnessCard } from "@/components/ui/fitness-card";
import {
  calculateDayTotals,
  getPlannedRecipe,
} from "@/src/lib/meal-planner/calculations";
import {
  mealSlots,
  type MealPlanState,
  type MealSlot,
  type Weekday,
} from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";

type DayCardProps = {
  day: Weekday;
  plan: MealPlanState;
  recipes: Recipe[];
  recipeMap: Map<string, Recipe>;
  onSlotChange: (day: Weekday, slot: MealSlot, slug: string | null) => void;
};

export function DayCard({
  day,
  plan,
  recipes,
  recipeMap,
  onSlotChange,
}: DayCardProps) {
  const totals = calculateDayTotals(plan, day, recipeMap);

  return (
    <FitnessCard className="hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(23,33,28,0.12)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-start">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Day plan
          </p>
          <h2 className="mt-1 font-display text-2xl font-black">{day}</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl border border-accent/25 bg-accent/10 px-3 py-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-accent-strong">
              Calories
            </p>
            <p className="mt-1 font-black">{totals.calories}</p>
          </div>
          <div className="rounded-2xl bg-stone-100 px-3 py-2">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">
              Protein
            </p>
            <p className="mt-1 font-black">{totals.protein}g</p>
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {mealSlots.map((slot) => (
          <MealSlotCard
            key={slot}
            slot={slot}
            selectedSlug={plan[day][slot]}
            selectedRecipe={getPlannedRecipe(plan, day, slot, recipeMap)}
            recipes={recipes}
            onChange={(slug) => onSlotChange(day, slot, slug)}
          />
        ))}
      </div>
    </FitnessCard>
  );
}
