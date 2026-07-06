import { WorkoutMode } from "@/components/workout-mode/workout-mode";
import { Suspense } from "react";

export default function LiveWorkoutPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutMode />
    </Suspense>
  );
}
