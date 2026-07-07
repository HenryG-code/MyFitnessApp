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
      title={
        item.recipeTitles.length ? `Used in: ${item.recipeTitles.join(", ")}` : undefined
      }
      className={`lf-press flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 transition ${
        checked ? "opacity-55" : "hover:bg-white/[0.04]"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onToggle(item.id, event.target.checked)}
        className="sr-only"
      />
      <span
        className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${
          checked
            ? "liftlog-pop-in border-ready/50 bg-ready/15 text-ready"
            : "border-line bg-card text-transparent"
        }`}
      >
        <Check className="size-3" />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-sm font-semibold ${
          checked ? "text-ink-dim line-through" : ""
        }`}
      >
        {item.name}
      </span>
      {item.count > 1 ? (
        <span className="lf-num shrink-0 rounded-full bg-white/[0.06] px-2 py-0.5 text-[0.62rem] font-bold text-muted">
          ×{item.count}
        </span>
      ) : null}
    </label>
  );
}
