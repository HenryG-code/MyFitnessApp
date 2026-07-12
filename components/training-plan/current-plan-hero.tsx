import { HeroPanel } from "@/components/ui/hero-panel";
import type {
  TrainingPlan,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import { ArrowDown, Clock, Dumbbell, Gauge, Sparkles } from "lucide-react";

export function CurrentPlanHero({
  plan,
  nextSession,
}: {
  plan: TrainingPlan;
  nextSession: TrainingSession;
}) {
  return (
    <HeroPanel
      eyebrow="Your current suggested plan"
      title={plan.title}
      description={`${plan.goal} · ${plan.level} · ${plan.days.length} training days per week. This remains your default until you change it below.`}
      imageSrc={fitnessImages.cardioRunner}
      imageAlt="Athlete preparing for a training session"
      variant="amber"
    >
      <div className="mt-4 min-w-0 rounded-xl border border-white/10 bg-black/35 p-3 backdrop-blur sm:mt-6 sm:max-w-2xl sm:rounded-2xl sm:p-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[0.62rem] font-black uppercase tracking-[0.16em] text-sun">
              <Sparkles className="size-3.5" />
              Next workout
            </p>
            <h2 className="mt-1 truncate font-display text-xl font-black sm:text-2xl">
              {nextSession.title}
            </h2>
            <p className="mt-0.5 text-xs text-stone-300">
              {nextSession.dayLabel} · {nextSession.sessionType}
            </p>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white">
            <Dumbbell className="size-5" />
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[0.65rem] font-black text-stone-300 sm:gap-2 sm:text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
            <Clock className="size-3.5" />
            {nextSession.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5">
            <Gauge className="size-3.5" />
            {nextSession.intensity}
          </span>
        </div>

        <div className="mt-3 grid min-w-0 gap-1.5 sm:grid-cols-3">
          {nextSession.exercises.slice(0, 3).map((exercise, index) => (
            <div
              key={exercise.name}
              className="flex min-w-0 items-center gap-2 rounded-lg bg-white/[0.06] p-2"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/10 text-[0.6rem] font-black text-sun">
                {index + 1}
              </span>
              <span className="truncate text-[0.68rem] font-bold text-stone-200">
                {exercise.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#plan-builder"
        className="lf-press mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 text-xs font-black text-stone-200"
      >
        Change my plan
        <ArrowDown className="size-3.5" />
      </a>
    </HeroPanel>
  );
}
