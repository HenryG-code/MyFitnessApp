import { GroceryList } from "@/components/grocery-list/grocery-list";
import { HeroPanel } from "@/components/ui/hero-panel";
import { getAllRecipes } from "@/src/lib/recipes/data";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { ClipboardList, ShoppingBasket, Sparkles } from "lucide-react";

export default function GroceryListPage() {
  const recipes = getAllRecipes();

  return (
    <div className="space-y-5">
      <HeroPanel
        eyebrow="Grocery list"
        title="Grocery list"
        description="Generated from your weekly meal plan."
        imageSrc={fitnessImages.fitnessCommunity}
        imageAlt="Healthy meal prep and fitness planning"
        variant="default"
      >

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <ShoppingBasket className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Grouped</p>
            <p className="text-sm text-stone-300">By grocery category</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <ClipboardList className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Checked</p>
            <p className="text-sm text-stone-300">Saved on this device</p>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 p-4">
            <Sparkles className="size-5 text-sun" />
            <p className="mt-3 text-2xl font-black">Simple</p>
            <p className="text-sm text-stone-300">Ready for the shop</p>
          </div>
        </div>
      </HeroPanel>

      <GroceryList recipes={recipes} />
    </div>
  );
}
