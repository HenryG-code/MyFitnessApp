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

  const remaining = visibleItems.filter((item) => !checkedItems[item.id]).length;

  return (
    <section className="lf-panel p-3 sm:p-3.5">
      <div className="mb-1.5 flex items-center justify-between px-2">
        <p className="lf-eyebrow !text-[0.62rem] text-accent-strong">
          {category}
        </p>
        <p className="lf-num text-[0.65rem] font-bold text-ink-dim">
          {remaining} left
        </p>
      </div>
      <div className="space-y-0.5">
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
