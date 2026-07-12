import type { TodayMission } from "@/src/lib/performance/mission";
import { ArrowRight, Check, Play } from "lucide-react";
import Link from "next/link";

export function MissionPanel({ mission }: { mission: TodayMission }) {
  return (
    <section className="lf-rise lf-rise-3 lf-panel relative flex flex-col justify-center overflow-hidden p-4 sm:p-5">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(26rem 14rem at 12% 120%, rgba(240,71,46,0.12), transparent)",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="lf-eyebrow text-accent-strong">
            {mission.alreadyTrainedToday
              ? "Mission complete"
              : "Today's mission"}
          </p>
          <span className="lf-num rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-bold text-muted">
            {mission.completedThisWeek}/{mission.totalSessions} this week
          </span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-black leading-tight tracking-tight sm:text-3xl">
          {mission.session.title}
        </h2>
        <p className="lf-num mt-1.5 text-sm font-semibold text-muted">
          {mission.session.durationMinutes} min ·{" "}
          {mission.session.exercises.length} exercises ·{" "}
          {mission.session.intensity}
        </p>

        {mission.alreadyTrainedToday ? (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <p className="flex items-center gap-2 rounded-xl border border-ready/25 bg-ready/10 px-4 py-3 text-sm font-bold text-ready">
              <Check className="size-4" />
              Session logged today. Recovery is training too.
            </p>
            <Link
              href={`/workouts/live?goal=${encodeURIComponent(mission.goal)}&session=${mission.sessionIndex}`}
              className="lf-press inline-flex items-center justify-center gap-2 rounded-xl border border-line px-4 py-3 text-sm font-bold text-muted transition hover:text-foreground"
            >
              Train anyway
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <Link
            href={`/workouts/live?goal=${encodeURIComponent(mission.goal)}&session=${mission.sessionIndex}`}
            className="lf-press mt-4 flex h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl bg-accent text-[0.95rem] font-black tracking-wide text-white shadow-[0_10px_30px_rgba(240,71,46,0.35)] transition hover:bg-accent-strong"
          >
            <Play className="size-4 fill-current" />
            BEGIN WORKOUT
          </Link>
        )}

        <div className="mt-3 flex items-center justify-between">
          <Link
            href="/training-plan"
            className="text-xs font-bold text-muted transition hover:text-foreground"
          >
            {mission.goal} plan →
          </Link>
          <Link
            href="/workouts/new"
            className="text-xs font-bold text-muted transition hover:text-foreground"
          >
            Log manually
          </Link>
        </div>
      </div>
    </section>
  );
}
