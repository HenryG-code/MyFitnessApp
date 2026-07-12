import { WarmUpPage } from "@/components/warm-up/warm-up-page";

export default async function WarmUpRoute({
  searchParams,
}: {
  searchParams: Promise<{ habitId?: string }>;
}) {
  const { habitId } = await searchParams;
  return <WarmUpPage requestedHabitId={habitId} />;
}
