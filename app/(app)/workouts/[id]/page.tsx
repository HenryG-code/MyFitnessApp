import { WorkoutDetail } from "@/components/workouts/workout-detail";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WorkoutDetail workoutId={id} />;
}
