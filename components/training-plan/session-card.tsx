import { FitnessCard } from "@/components/ui/fitness-card";
import { canLogSession } from "@/src/lib/training-plans/calculations";
import type { TrainingSession } from "@/src/lib/training-plans/types";
import { Clock, Dumbbell, Gauge, Plus } from "lucide-react";
import Link from "next/link";

type SessionCardProps = {
  session: TrainingSession;
};

export function SessionCard({ session }: SessionCardProps) {
  const canLogWorkout = canLogSession(session.sessionType);

  return (
    <FitnessCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">
            {session.dayLabel} / {session.sessionType}
          </p>
          <h3 className="mt-2 font-display text-2xl font-black">
            {session.title}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-sm font-black text-muted">
            <Clock className="size-4" />
            {session.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#eaf3dd] px-3 py-2 text-sm font-black text-accent-strong">
            <Gauge className="size-4" />
            {session.intensity}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {session.exercises.map((exercise) => (
          <div
            key={`${session.dayLabel}-${exercise.name}`}
            className="rounded-2xl border border-line bg-white/65 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-stone-950 text-white">
                <Dumbbell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-black">
                  {exercise.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-muted">
                  {exercise.sets ? <span>{exercise.sets} sets</span> : null}
                  {exercise.reps ? <span>{exercise.reps} reps</span> : null}
                  {exercise.duration ? <span>{exercise.duration}</span> : null}
                  {exercise.rest ? <span>Rest {exercise.rest}</span> : null}
                </div>
                {exercise.notes ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {exercise.notes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl bg-stone-100 p-4 text-sm font-bold leading-6 text-muted">
        {session.notes}
      </p>

      {canLogWorkout ? (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-muted">
            Manual logging keeps this version simple.
          </p>
          <Link
            href="/workouts/new"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong"
          >
            <Plus className="size-4" />
            Log workout
          </Link>
        </div>
      ) : null}
    </FitnessCard>
  );
}
