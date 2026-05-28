import { FitnessCard, SectionHeader } from "@/components/ui/fitness-card";
import { workoutHistory } from "@/lib/mock-data";
import { CalendarDays, Clock, Plus } from "lucide-react";
import Link from "next/link";

export default function WorkoutsPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-line/80 bg-card/80 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-accent">
            Workout log
          </p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight">
            Keep your training visible.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Mock workouts for now, structured so a Supabase table can slot in
            later without changing the route.
          </p>
        </div>
        <Link
          href="/workouts/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-900/15"
        >
          <Plus className="size-4" />
          New workout
        </Link>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {workoutHistory.map((workout) => (
          <FitnessCard key={workout.title}>
            <SectionHeader eyebrow={workout.type} title={workout.title} />
            <p className="text-sm leading-6 text-muted">{workout.notes}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-muted">
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2">
                <CalendarDays className="size-4" />
                {workout.date}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2">
                <Clock className="size-4" />
                {workout.duration}
              </span>
            </div>
          </FitnessCard>
        ))}
      </div>
    </div>
  );
}
