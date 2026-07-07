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
  evaluateWeeklyGroceryReset,
  hasCheckedGroceryItems,
  loadCheckedGroceryItems,
  normalizeCheckedGroceryItems,
  saveCheckedGroceryItems,
} from "@/src/lib/grocery-list/storage";
import { groceryCategories, type CheckedGroceryItems } from "@/src/lib/grocery-list/types";
import {
  createEmptyMealPlan,
  loadMealPlanFromStorage,
  normalizeMealPlanState,
  saveMealPlanToStorage,
} from "@/src/lib/meal-planner/storage";
import type { MealPlanState } from "@/src/lib/meal-planner/types";
import type { Recipe } from "@/src/lib/recipes/data";
import {
  announcePreferenceSyncStatus,
  ensureUserPreferences,
  parseGroceryCheckedItems,
  parseMealPlan,
  updateGroceryCheckedItems,
  updateMealPlan,
} from "@/src/lib/user-preferences/queries";
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
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadGroceryState() {
      const storedPlan = loadMealPlanFromStorage();
      // Weekly reset: checked-off items start fresh each Monday. The helper
      // is memoised per page load so concurrent mounts agree on the answer.
      const isNewWeek = evaluateWeeklyGroceryReset();
      const storedCheckedItems = isNewWeek ? {} : loadCheckedGroceryItems();

      if (isNewWeek) {
        setStatusMessage("New week — checked items were reset.");
      }

      setPlan(storedPlan);
      setCheckedItems(storedCheckedItems);

      try {
        const preferences = await ensureUserPreferences();
        const syncedPlan = parseMealPlan(preferences);
        const syncedCheckedItems = parseGroceryCheckedItems(preferences);

        if (syncedPlan && isMounted) {
          const normalizedPlan = normalizeMealPlanState(syncedPlan);
          setPlan(normalizedPlan);
          saveMealPlanToStorage(normalizedPlan);
        } else {
          await updateMealPlan(storedPlan);
        }

        if (isNewWeek) {
          // Propagate the weekly reset to synced preferences too.
          await updateGroceryCheckedItems({});
        } else if (syncedCheckedItems && isMounted) {
          const normalizedCheckedItems =
            normalizeCheckedGroceryItems(syncedCheckedItems);
          setCheckedItems(normalizedCheckedItems);
          saveCheckedGroceryItems(normalizedCheckedItems);
          announcePreferenceSyncStatus("synced");
        } else if (hasCheckedGroceryItems(storedCheckedItems)) {
          await updateGroceryCheckedItems(storedCheckedItems);
        }
      } catch {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      } finally {
        if (isMounted) {
          setHasLoadedStorage(true);
        }
      }
    }

    void loadGroceryState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (hasLoadedStorage) {
      saveCheckedGroceryItems(checkedItems);
      updateGroceryCheckedItems(checkedItems).catch(() => {
        announcePreferenceSyncStatus("fallback", "Saved on this device.");
      });
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
    setStatusMessage(checked ? "Item checked off." : "Item returned to the list.");
  }

  function clearCheckedFromView() {
    if (!summary.checkedItemsCount) {
      return;
    }

    const confirmed = window.confirm("Hide checked grocery items from the list?");

    if (confirmed) {
      setHideCheckedItems(true);
      setStatusMessage("Checked items hidden.");
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
    setStatusMessage("Checked states reset.");
  }

  if (hasLoadedStorage && plannedMealsCount === 0) {
    return (
      <FitnessCard>
        <div className="p-2 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent-strong">
            <ShoppingBasket className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-lg font-black">
            No planned meals yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted">
            Add recipes to your Meal Planner and your grocery list builds
            itself.
          </p>
          <Link
            href="/meal-planner"
            className="lf-press mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white transition hover:bg-accent-strong"
          >
            <CalendarDays className="size-4" />
            Open Meal Planner
          </Link>
        </div>
      </FitnessCard>
    );
  }

  return (
    <div className="space-y-3">
      <GrocerySummary summary={summary} />

      {statusMessage ? (
        <p
          role="status"
          className="liftlog-pop-in rounded-xl border border-line bg-white/[0.03] p-2.5 text-xs font-bold text-muted"
        >
          {statusMessage}
        </p>
      ) : null}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-1">
        <p className="lf-num text-[0.7rem] font-bold text-ink-dim">
          {allGroceryItems.length} ingredients · resets each Monday
        </p>
        <div className="flex gap-1.5">
          {hideCheckedItems ? (
            <button
              type="button"
              onClick={() => setHideCheckedItems(false)}
              className="lf-press rounded-lg border border-line px-3 py-1.5 text-[0.7rem] font-bold text-muted transition hover:text-foreground"
            >
              Show checked
            </button>
          ) : (
            <button
              type="button"
              onClick={clearCheckedFromView}
              disabled={!summary.checkedItemsCount}
              className="lf-press flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[0.7rem] font-bold text-muted transition hover:text-foreground disabled:opacity-40"
            >
              <EyeOff className="size-3" />
              Hide checked
            </button>
          )}
          <button
            type="button"
            onClick={resetCheckedItems}
            disabled={!summary.checkedItemsCount}
            className="lf-press flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[0.7rem] font-bold text-muted transition hover:text-foreground disabled:opacity-40"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
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
