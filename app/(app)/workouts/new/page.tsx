import { WorkoutForm } from "@/components/forms/workout-form";
import { ArrowLeft, Dumbbell, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams?: Promise<{ exercise?: string | string[] }>;
}) {
  const params = await searchParams;
  const exerciseValue = Array.isArray(params?.exercise)
    ? params.exercise[0]
    : params?.exercise;
  const initialExercise = exerciseValue?.trim().slice(0, 80) ?? "";

  return (
    <div className="mx-auto max-w-5xl space-y-3 sm:space-y-5">
      <header className="relative isolate overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#101012] px-4 py-4 shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:rounded-[2rem] sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute -right-20 -top-28 -z-10 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.045),transparent_42%)]" />

        <Link
          href="/workouts"
          className="lf-press inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 text-xs font-black text-muted transition hover:text-white"
        >
          <ArrowLeft className="size-3.5" />
          Back to Train
        </Link>

        <div className="mt-5 flex items-end justify-between gap-5 sm:mt-7">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_16px_rgba(240,71,46,0.9)]" />
              <p className="text-[0.62rem] font-black uppercase tracking-[0.24em] text-accent-strong">
                Manual session
              </p>
            </div>
            <h1 className="mt-2 font-display text-[2rem] font-black leading-none tracking-[-0.04em] sm:text-5xl">
              Build your workout.
            </h1>
            <p className="mt-3 max-w-xl text-xs leading-5 text-muted sm:text-sm sm:leading-6">
              Capture the work that matters. Everything else stays quiet.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 sm:flex">
            <span className="grid size-11 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_28px_rgba(240,71,46,0.28)]">
              <Dumbbell className="size-5" />
            </span>
            <div>
              <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-ink-dim">
                Session mode
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm font-black">
                <Sparkles className="size-3.5 text-sun" />
                Focused entry
              </p>
            </div>
          </div>
        </div>
      </header>

      <WorkoutForm initialExercise={initialExercise} />
    </div>
  );
}
