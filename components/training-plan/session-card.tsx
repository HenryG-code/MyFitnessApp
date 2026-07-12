"use client";

import { FitnessCard } from "@/components/ui/fitness-card";
import { logTrainingPlanSession } from "@/src/lib/training-plans/log-workout";
import type {
  SessionType,
  TrainingPlan,
  TrainingSession,
} from "@/src/lib/training-plans/types";
import {
  Activity,
  ArrowLeftRight,
  BicepsFlexed,
  Bike,
  ChevronDown,
  Clock,
  Dumbbell,
  Footprints,
  Gauge,
  HeartPulse,
  PersonStanding,
  Plus,
  ShieldCheck,
  StretchHorizontal,
  Wind,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SessionCardProps = {
  plan: TrainingPlan;
  session: TrainingSession;
  onLogged?: () => Promise<void> | void;
};

const sessionIcons: Record<SessionType, LucideIcon> = {
  Strength: Dumbbell,
  Cardio: HeartPulse,
  Mobility: StretchHorizontal,
  Yoga: PersonStanding,
  Recovery: Activity,
  Hybrid: Gauge,
};

function getExerciseIcon(name: string): LucideIcon {
  const exercise = name.toLowerCase();

  if (/breath/.test(exercise)) return Wind;
  if (/bike|cycle/.test(exercise)) return Bike;
  if (/walk|run|jog|treadmill|cardio|elliptical|zone 2/.test(exercise)) {
    return HeartPulse;
  }
  if (/stretch|mobility|yoga|cat-cow|child.?s pose/.test(exercise)) {
    return StretchHorizontal;
  }
  if (/plank|core|dead bug|bird dog|pallof/.test(exercise)) {
    return ShieldCheck;
  }
  if (/squat|lunge|leg press|leg extension|calf|step-up|split squat/.test(exercise)) {
    return Footprints;
  }
  if (/row|pulldown|pull-up|pull up|face pull/.test(exercise)) {
    return ArrowLeftRight;
  }
  if (/curl|triceps|biceps/.test(exercise)) return BicepsFlexed;
  if (/press|deadlift|hinge|carry|raise|fly/.test(exercise)) return Dumbbell;

  return Activity;
}

export function SessionCard({ plan, session, onLogged }: SessionCardProps) {
  const [createdWorkoutId, setCreatedWorkoutId] = useState("");
  const [error, setError] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const SessionIcon = sessionIcons[session.sessionType];
  const detailsId = `session-${plan.slug}-${session.dayLabel.replace(/\s+/g, "-").toLowerCase()}`;

  async function handleLogSession() {
    setError("");
    setCreatedWorkoutId("");
    setIsLogging(true);

    try {
      const workout = await logTrainingPlanSession(plan, session);
      setCreatedWorkoutId(workout.id);
      await onLogged?.();
    } catch (logError) {
      setError(
        logError instanceof Error
          ? logError.message
          : "Could not log this session."
      );
    } finally {
      setIsLogging(false);
    }
  }

  return (
    <FitnessCard className={`min-w-0 !p-3 transition sm:!p-4 ${isExpanded ? "border-accent/25" : "hover:border-accent/20"}`}>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        className="lf-press w-full min-w-0 text-left"
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent-strong sm:size-11">
            <SessionIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.62rem] font-black uppercase tracking-[0.18em] text-accent sm:text-xs">
              {session.dayLabel} · {session.sessionType}
            </span>
            <span className="mt-0.5 block truncate font-display text-lg font-black sm:text-xl">
              {session.title}
            </span>
          </span>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-muted">
            <ChevronDown
              className={`size-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </span>
        </div>

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 text-[0.65rem] font-black text-muted">
            <Clock className="size-4" />
            {session.durationMinutes} min
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[0.65rem] font-black text-accent-strong">
            <Gauge className="size-4" />
            {session.intensity}
          </span>
          <span className="ml-auto shrink-0 text-[0.65rem] font-bold text-muted">
            {session.exercises.length} exercises
          </span>
        </div>

        <div className="mt-2.5 flex min-w-0 items-center gap-1.5" aria-hidden="true">
          {session.exercises.slice(0, 4).map((exercise) => {
            const ExerciseIcon = getExerciseIcon(exercise.name);
            return (
              <span
                key={`${session.dayLabel}-preview-${exercise.name}`}
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.035] text-muted"
                title={exercise.name}
              >
                <ExerciseIcon className="size-4" />
              </span>
            );
          })}
          <span className="ml-1 min-w-0 truncate text-[0.68rem] font-bold text-muted">
            {session.exercises.slice(0, 2).map((exercise) => exercise.name).join(" · ")}
          </span>
        </div>
      </button>

      {isExpanded ? (
        <div id={detailsId} className="liftlog-pop-in mt-3 border-t border-line pt-3">
          <div className="grid gap-2 sm:gap-3">
            {session.exercises.map((exercise) => {
              const ExerciseIcon = getExerciseIcon(exercise.name);
              return (
                <div
                  key={`${session.dayLabel}-${exercise.name}`}
                  className="liftlog-slide-in rounded-xl border border-line/80 bg-white/[0.04] p-3 transition hover:border-accent/35 hover:bg-white/[0.065] sm:rounded-2xl sm:p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent/12 text-accent-strong sm:size-9 sm:rounded-xl">
                      <ExerciseIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base font-black sm:text-lg">
                        {exercise.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[0.7rem] font-black text-muted sm:mt-2 sm:text-xs">
                        {exercise.sets ? <span>{exercise.sets} sets</span> : null}
                        {exercise.reps ? <span>{exercise.reps} reps</span> : null}
                        {exercise.duration ? <span>{exercise.duration}</span> : null}
                        {exercise.rest ? <span>Rest {exercise.rest}</span> : null}
                      </div>
                      {exercise.notes ? (
                        <p className="mt-1.5 text-xs leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">
                          {exercise.notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 rounded-xl bg-white/[0.06] p-3 text-xs font-bold leading-5 text-muted sm:rounded-2xl sm:p-4 sm:text-sm sm:leading-6">
            {session.notes}
          </p>

          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-xs font-bold text-muted sm:text-sm">
              Use this session as a guide, then log your completed workout.
            </p>
            <button
              type="button"
              onClick={() => void handleLogSession()}
              disabled={isLogging}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl sm:py-3"
            >
              <Plus className="size-4" />
              {isLogging ? "Logging..." : "Log workout"}
            </button>
          </div>

          {createdWorkoutId ? (
            <div className="liftlog-pop-in mt-4 rounded-2xl border border-accent/30 bg-accent/15 p-4 text-sm font-bold text-soft-yellow">
              Workout logged.{" "}
              <Link
                href={`/workouts/${createdWorkoutId}`}
                className="font-black underline decoration-accent/60 underline-offset-4"
              >
                View workout
              </Link>
            </div>
          ) : null}

          {error ? (
            <p className="liftlog-pop-in mt-4 rounded-2xl border border-red-400/30 bg-red-950/40 p-4 text-sm font-bold text-red-100">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </FitnessCard>
  );
}
