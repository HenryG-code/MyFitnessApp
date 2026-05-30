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
    <div className="space-y-5">
      <FitnessCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
              Selected plan
            </p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight">
              {plan.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {plan.description}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-sm font-black text-soft-yellow">
            <ShieldCheck className="size-4" />
            General guidance
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Recommended for
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {plan.recommendedFor}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-line bg-white/65 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted">
              Weekly focus
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-muted">
              {plan.weeklyFocus}
            </p>
          </div>
        </div>
      </FitnessCard>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
