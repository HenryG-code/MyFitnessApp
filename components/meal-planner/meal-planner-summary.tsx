import { MetricCard } from "@/components/ui/fitness-card";
import type { MealPlanTotals } from "@/src/lib/meal-planner/types";
import { CalendarCheck, Flame, Sigma, Utensils } from "lucide-react";

type MealPlannerSummaryProps = {
  totals: MealPlanTotals;
};

export function MealPlannerSummary({ totals }: MealPlannerSummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard
        label="Weekly calories"
        value={`${totals.weeklyCalories}`}
        detail="Total planned energy."
        icon={<Flame className="size-5" />}
        tone="yellow"
      />
      <MetricCard
        label="Weekly protein"
        value={`${totals.weeklyProtein}g`}
        detail="Protein across planned meals."
        icon={<Utensils className="size-5" />}
        tone="amber"
      />
      <MetricCard
        label="Average daily calories"
        value={`${totals.averageDailyCalories}`}
        detail="Weekly total divided by 7."
        icon={<Sigma className="size-5" />}
        tone="ink"
      />
      <MetricCard
        label="Average daily protein"
        value={`${totals.averageDailyProtein}g`}
        detail="Protein average per day."
        icon={<Sigma className="size-5" />}
        tone="yellow"
      />
      <MetricCard
        label="Planned meals"
        value={`${totals.plannedMealsCount}`}
        detail="Filled meal slots this week."
        icon={<CalendarCheck className="size-5" />}
        tone="amber"
      />
    </section>
  );
}
