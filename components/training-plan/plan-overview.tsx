import { MetricCard, FitnessCard } from "@/components/ui/fitness-card";
import { calculateTrainingPlanSummary } from "@/src/lib/training-plans/calculations";
import type { TrainingPlan } from "@/src/lib/training-plans/types";
import { Activity, Clock, Dumbbell, HeartPulse, Repeat, ShieldCheck } from "lucide-react";

type PlanOverviewProps = {
  plan: TrainingPlan;
};

export function PlanOverview({ plan }: PlanOverviewProps) {
  const summary = calculateTrainingPlanSummary(plan);

  return (
    <div className="space-y-3 sm:space-y-5">
      <FitnessCard className="!p-3 sm:!p-5">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
              Selected plan
            </p>
            <h2 className="mt-1 font-display text-xl font-black tracking-tight sm:mt-2 sm:text-3xl">
              {plan.title}
            </h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-muted sm:mt-3 sm:text-sm sm:leading-6">
              {plan.description}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-black text-soft-yellow sm:py-2 sm:text-sm">
            <ShieldCheck className="size-4" />
            General guidance
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3">
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Recommended for
            </p>
            <p className="mt-1.5 text-xs font-bold leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
              {plan.recommendedFor}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.055] p-3 shadow-inner shadow-white/[0.02] sm:rounded-[1.25rem] sm:p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Weekly focus
            </p>
            <p className="mt-1.5 text-xs font-bold leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
              {plan.weeklyFocus}
            </p>
          </div>
        </div>
      </FitnessCard>

      <section className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-5">
        <MetricCard
          label="Sessions"
          value={`${summary.sessions}`}
          detail="Suggested training days."
          icon={<Repeat className="size-5" />}
          tone="yellow"
        />
        <MetricCard
          label="Weekly minutes"
          value={`${summary.weeklyMinutes}`}
          detail="Estimated active time."
          icon={<Clock className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Strength"
          value={`${summary.strengthSessions}`}
          detail="Strength or hybrid sessions."
          icon={<Dumbbell className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Cardio"
          value={`${summary.cardioSessions}`}
          detail="Cardio or hybrid sessions."
          icon={<HeartPulse className="size-5" />}
          tone="yellow"
        />
        <MetricCard
          label="Mobility"
          value={`${summary.mobilityRecoverySessions}`}
          detail="Mobility, yoga, or recovery."
          icon={<Activity className="size-5" />}
          tone="amber"
        />
      </section>
    </div>
  );
}
