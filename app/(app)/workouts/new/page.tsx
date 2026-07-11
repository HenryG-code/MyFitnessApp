import { WorkoutForm } from "@/components/forms/workout-form";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";

export default function NewWorkoutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-3 sm:space-y-5">
      <div className="hidden sm:block">
        <HeroPanel
          eyebrow="Log workout"
          title="Log your workout"
          description="Save the workout, add exercises, and keep your training history moving."
          imageSrc={fitnessImages.strengthTraining}
          imageAlt="Athlete logging a strength workout"
          variant="performance"
        />
      </div>

      <header className="sm:hidden">
        <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-accent">
          Manual logger
        </p>
        <h1 className="mt-0.5 font-display text-2xl font-black tracking-tight">
          Log your workout
        </h1>
        <p className="mt-1 text-xs leading-5 text-muted">
          Add the essentials now. Extra details stay out of the way.
        </p>
      </header>

      <FitnessCard className="p-3 sm:p-5">
        <div className="hidden sm:block">
          <SectionHeader eyebrow="Workout form" title="Workout details" />
        </div>
        <WorkoutForm />
      </FitnessCard>
    </div>
  );
}
