import { MetricCard } from "@/components/ui/fitness-card";
import type { GrocerySummary as GrocerySummaryType } from "@/src/lib/grocery-list/types";
import { CheckCircle2, ListChecks, ShoppingBasket, Utensils } from "lucide-react";

type GrocerySummaryProps = {
  summary: GrocerySummaryType;
};

export function GrocerySummary({ summary }: GrocerySummaryProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Planned meals"
        value={`${summary.plannedMealsCount}`}
        detail="Meals selected this week."
        icon={<Utensils className="size-5" />}
        tone="teal"
      />
      <MetricCard
        label="Unique ingredients"
        value={`${summary.uniqueIngredientsCount}`}
        detail="Duplicates combined."
        icon={<ShoppingBasket className="size-5" />}
        tone="amber"
      />
      <MetricCard
        label="Checked items"
        value={`${summary.checkedItemsCount}`}
        detail="Already handled."
        icon={<CheckCircle2 className="size-5" />}
        tone="ink"
      />
      <MetricCard
        label="Remaining"
        value={`${summary.remainingItemsCount}`}
        detail="Still on the list."
        icon={<ListChecks className="size-5" />}
        tone="teal"
      />
    </section>
  );
}
