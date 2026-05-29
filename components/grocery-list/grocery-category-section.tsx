import { GroceryItemRow } from "@/components/grocery-list/grocery-item-row";
import type {
  CheckedGroceryItems,
  GroceryCategory,
  GroceryItem,
} from "@/src/lib/grocery-list/types";

type GroceryCategorySectionProps = {
  category: GroceryCategory;
  items: GroceryItem[];
  checkedItems: CheckedGroceryItems;
  hideCheckedItems: boolean;
  onToggle: (id: string, checked: boolean) => void;
};

export function GroceryCategorySection({
  category,
  items,
  checkedItems,
  hideCheckedItems,
  onToggle,
}: GroceryCategorySectionProps) {
  const visibleItems = hideCheckedItems
    ? items.filter((item) => !checkedItems[item.id])
    : items;

  if (!visibleItems.length) {
    return null;
  }

  return (
    <section className="rounded-[1.75rem] border border-line/80 bg-card/85 p-5 shadow-[0_20px_60px_rgba(23,33,28,0.08)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            Category
          </p>
          <h2 className="mt-1 font-display text-2xl font-black">{category}</h2>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-black text-muted">
          {visibleItems.length}
        </span>
      </div>

      <div className="grid gap-3">
        {visibleItems.map((item) => (
          <GroceryItemRow
            key={item.id}
            item={item}
            checked={Boolean(checkedItems[item.id])}
            onToggle={onToggle}
          />
        ))}
      </div>
    </section>
  );
}
