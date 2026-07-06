import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
      >
        <ArrowLeft className="size-4" />
        Back to recipes
      </Link>
      <FitnessCard>
        <span className="grid size-14 place-items-center rounded-2xl bg-stone-950 text-white">
          <SearchX className="size-6" />
        </span>
        <div className="mt-5">
          <SectionHeader eyebrow="Not found" title="Recipe not found" />
        </div>
        <p className="text-sm leading-6 text-muted">
          This recipe is not in the local LogFit library yet. Head back to the
          recipe list and pick one of the available meals.
        </p>
      </FitnessCard>
    </div>
  );
}
