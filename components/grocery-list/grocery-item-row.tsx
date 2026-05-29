import type { GroceryItem } from "@/src/lib/grocery-list/types";
import { Check } from "lucide-react";

type GroceryItemRowProps = {
  item: GroceryItem;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
};

export function GroceryItemRow({
  item,
  checked,
  onToggle,
}: GroceryItemRowProps) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        checked
          ? "border-accent/20 bg-[#eaf3dd] text-muted"
          : "border-line bg-white/70 hover:-translate-y-0.5 hover:border-accent"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onToggle(item.id, event.target.checked)}
        className="sr-only"
      />
      <span
        className={`mt-1 grid size-6 shrink-0 place-items-center rounded-lg border ${
          checked
            ? "border-accent bg-accent text-white"
            : "border-line bg-card text-transparent"
        }`}
      >
        <Check className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-display text-lg font-black ${
            checked ? "line-through" : ""
          }`}
        >
          {item.name}
        </span>
        <span className="mt-1 block text-sm leading-6 text-muted">
          Used in {item.count} {item.count === 1 ? "recipe" : "recipes"}
          {item.recipeTitles.length ? `: ${item.recipeTitles.join(", ")}` : ""}
        </span>
      </span>
    </label>
  );
}
