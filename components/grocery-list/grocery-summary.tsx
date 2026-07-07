import type { GrocerySummary as GrocerySummaryType } from "@/src/lib/grocery-list/types";

type GrocerySummaryProps = {
  summary: GrocerySummaryType;
};

export function GrocerySummary({ summary }: GrocerySummaryProps) {
  const total = summary.uniqueIngredientsCount;
  const done = summary.checkedItemsCount;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <section className="lf-panel p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="lf-num font-display text-lg font-black">
          {summary.remainingItemsCount}
          <span className="ml-1.5 text-xs font-bold text-muted">
            item{summary.remainingItemsCount === 1 ? "" : "s"} to get
          </span>
        </p>
        <p className="lf-num text-xs font-bold text-muted">
          {done}/{total} done · {summary.plannedMealsCount} meals
        </p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-ready transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  );
}
