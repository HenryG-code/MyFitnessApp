import { NewWorkoutForm } from "@/components/forms/new-workout-form";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";

export default function NewWorkoutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-[2rem] border border-line/80 bg-stone-950 p-6 text-white shadow-[0_24px_80px_rgba(23,33,28,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-sun">
          New workout
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
          Log the session while it is still warm.
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-300">
          This form validates locally with React Hook Form and Zod. No database
          writes yet.
        </p>
      </section>

      <FitnessCard>
        <SectionHeader eyebrow="Mock form" title="Workout details" />
        <NewWorkoutForm />
      </FitnessCard>
    </div>
  );
}
