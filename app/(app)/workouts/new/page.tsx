import { WorkoutForm } from "@/components/forms/workout-form";
import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";

export default function NewWorkoutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <HeroPanel
        eyebrow="Log workout"
        title="Log your workout"
        description="Save the workout, add exercises, and keep your training history moving."
        imageSrc={fitnessImages.strengthTraining}
        imageAlt="Athlete logging a strength workout"
        variant="performance"
      />

      <FitnessCard>
        <SectionHeader eyebrow="Workout form" title="Workout details" />
        <WorkoutForm />
      </FitnessCard>
    </div>
  );
}
