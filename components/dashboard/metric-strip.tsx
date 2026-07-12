import type { HabitDaySummary } from "@/src/lib/habits/queries";
import { formatSleep, platformLabel, type HealthSummary } from "@/src/lib/health/queries";
import type { WeeklyLoad } from "@/src/lib/performance/readiness";
import type { WeightProgress } from "@/src/lib/dashboard/queries";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export type WeightTrend = "up" | "down" | "flat";

function TrendArrow({ direction }: { direction: WeightTrend }) {
  if (direction === "flat") {
    return null;
  }

  return direction === "down" ? (
    <ArrowDownRight className="size-3.5" />
  ) : (
    <ArrowUpRight className="size-3.5" />
  );
}

/** Metric strip — swaps in synced health metrics when connected. */
export function MetricStrip({
  health,
  streak,
  load,
  weight,
  weightTrend,
  todayHabits,
}: {
  health: HealthSummary;
  streak: number;
  load: WeeklyLoad;
  weight: WeightProgress;
  weightTrend: WeightTrend;
  todayHabits: HabitDaySummary;
}) {
  return (
    <>
      <section className="lf-rise lf-rise-2 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
        {health.today?.steps != null ? (
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Steps</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {new Intl.NumberFormat("en").format(health.today.steps)}
            </p>
            <p
              className={`lf-num mt-0.5 text-[0.65rem] font-bold ${
                health.today.steps >= health.goals.dailySteps
                  ? "text-ready"
                  : "text-muted"
              }`}
            >
              {Math.min(
                999,
                Math.round((health.today.steps / health.goals.dailySteps) * 100)
              )}
              % of goal
            </p>
          </div>
        ) : (
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Streak</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {streak}
            </p>
            <p className="mt-0.5 text-[0.65rem] font-bold text-muted">
              {streak === 1 ? "day" : "days"}
            </p>
          </div>
        )}
        {health.today?.sleep_minutes != null ? (
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Sleep</p>
            <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
              {formatSleep(health.today.sleep_minutes)}
            </p>
            <p
              className={`mt-0.5 text-[0.65rem] font-bold ${
                health.today.sleep_minutes >= health.goals.sleepMinutes - 30
                  ? "text-ready"
                  : "text-muted"
              }`}
            >
              of {formatSleep(health.goals.sleepMinutes)}
            </p>
          </div>
        ) : (
          <div className="lf-inset min-w-0 p-2.5 sm:p-3">
            <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Load</p>
            <p className="mt-1 break-words font-display text-base font-black leading-tight sm:text-xl">
              {load.label}
            </p>
            <p className="lf-num mt-0.5 text-[0.65rem] font-bold text-muted">
              {load.minutes} min
            </p>
          </div>
        )}
        <Link href="/weight" className="lf-press lf-inset block min-w-0 p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Weight</p>
          <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
            {weight.currentWeight !== null
              ? weight.currentWeight.toFixed(1)
              : "—"}
          </p>
          <p
            className={`mt-0.5 flex items-center gap-0.5 text-[0.65rem] font-bold ${
              weightTrend === "down"
                ? "text-ready"
                : weightTrend === "up"
                  ? "text-caution"
                  : "text-muted"
            }`}
          >
            <TrendArrow direction={weightTrend} />
            {weight.totalChange !== null
              ? `${Math.abs(weight.totalChange).toFixed(1)} kg`
              : "kg"}
          </p>
        </Link>
        <Link href="/habits" className="lf-press lf-inset block min-w-0 p-2.5 sm:p-3">
          <p className="lf-eyebrow !text-[0.56rem] sm:!text-[0.62rem]">Habits</p>
          <p className="lf-num mt-1 font-display text-base font-black sm:text-xl">
            {todayHabits.percentage}%
          </p>
          <p className="lf-num mt-0.5 text-[0.65rem] font-bold text-muted">
            {todayHabits.completed}/{todayHabits.total} today
          </p>
        </Link>
      </section>
      {health.connection ? (
        <p className="lf-rise lf-rise-2 -mt-1 px-1 text-right text-[0.6rem] font-semibold text-ink-dim">
          Synced from {platformLabel(health.connection.platform)}
        </p>
      ) : null}
    </>
  );
}
