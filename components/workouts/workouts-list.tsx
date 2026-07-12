"use client";

import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import { HeroPanel } from "@/components/ui/hero-panel";
import { RestTimer } from "@/components/workouts/rest-timer";
import {
  deleteWorkout,
  fetchWorkouts,
  type WorkoutListItem,
} from "@/src/lib/workouts/queries";
import { fitnessImages } from "@/src/lib/visuals/fitness-images";
import {
  CalendarDays,
  Clock,
  Dumbbell,
  Flame,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function getStartOfWeek() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - now.getDay());
  return start;
}

function getStats(workouts: WorkoutListItem[]) {
  const weekStart = getStartOfWeek();
  const workoutsThisWeek = workouts.filter(
    (workout) => new Date(`${workout.workout_date}T00:00:00`) >= weekStart
  ).length;
  const totalMinutes = workouts.reduce(
    (sum, workout) => sum + (workout.duration_minutes ?? 0),
    0
  );

  return {
    workoutsThisWeek,
    totalWorkouts: workouts.length,
    latestWorkout: workouts[0],
    totalMinutes,
  };
}

export function WorkoutsList() {
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function refreshWorkouts() {
    setError("");

    try {
      const data = await fetchWorkouts();
      setWorkouts(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load workouts."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    fetchWorkouts()
      .then((data) => {
        if (isMounted) {
          setWorkouts(data);
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load workouts."
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = getStats(workouts);

  async function handleDelete(workout: WorkoutListItem) {
    const confirmed = window.confirm(`Delete "${workout.title}"?`);

    if (!confirmed) {
      return;
    }

    setNotice("");
    setError("");
    setDeletingId(workout.id);

    try {
      await deleteWorkout(workout.id);
      setNotice("Workout deleted.");
      await refreshWorkouts();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this workout."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <section className="lf-panel p-3 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="lf-eyebrow">Workout log</p>
            <h1 className="mt-1 font-display text-2xl font-black tracking-tight">
              Train
            </h1>
            <p className="mt-1 text-xs leading-5 text-muted">
              Time your rest, review sessions, and log today&apos;s work.
            </p>
          </div>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_8px_24px_rgba(240,71,46,0.3)]">
            <Dumbbell className="size-5" />
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/training-plan"
            className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.04] px-3 text-sm font-black"
          >
            <Target className="size-4" />
            Plan
          </Link>
          <Link
            href="/workouts/new"
            className="lf-press inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3 text-sm font-black text-white"
          >
            <Plus className="size-4" />
            Log workout
          </Link>
        </div>
      </section>

      <div className="hidden sm:block">
        <HeroPanel
          eyebrow="Workout log"
          title="Keep your training visible."
          description="Track your sessions, exercises, notes, and progress over time."
          imageSrc={fitnessImages.strengthTraining}
          imageAlt="Strength training session"
          variant="performance"
        >
          <div className="flex flex-wrap gap-2">
            <Link
              href="/training-plan"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-stone-900/10 transition hover:bg-accent"
            >
              <Target className="size-4" />
              Training plan
            </Link>
            <Link
              href="/workouts/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950 shadow-lg shadow-accent/20"
            >
              <Plus className="size-4" />
              Log workout
            </Link>
          </div>
        </HeroPanel>
      </div>

      <section className="grid gap-3 sm:gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <RestTimer />
        <FitnessCard className="hidden border-accent/25 bg-gradient-to-br from-white/[0.04] via-card to-sun/10 sm:block">
          <SectionHeader eyebrow="Gym assistant" title="Ready when you train" />
          <p className="text-sm leading-6 text-muted">
            Keep this page open during your session. Time your rests, check your
            recent training, then log the workout when you are done.
          </p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Link
              href="/workouts/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              <Plus className="size-4" />
              Log workout
            </Link>
            <Link
              href="/training-plan"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm font-black transition hover:-translate-y-0.5 hover:border-accent"
            >
              <Target className="size-4" />
              View plan
            </Link>
          </div>
        </FitnessCard>
      </section>

      {notice ? (
        <p className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-4 text-sm font-black text-soft-yellow">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid grid-cols-2 gap-2 sm:hidden" aria-label="Training summary">
        <div className="lf-inset p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="lf-eyebrow !text-[0.58rem]">This week</p>
            <Flame className="size-4 text-accent-strong" />
          </div>
          <p className="lf-num mt-2 font-display text-2xl font-black">
            {stats.workoutsThisWeek}
          </p>
          <p className="text-[0.68rem] text-muted">workouts</p>
        </div>
        <div className="lf-inset p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="lf-eyebrow !text-[0.58rem]">Total time</p>
            <Clock className="size-4 text-sun" />
          </div>
          <p className="lf-num mt-2 font-display text-2xl font-black">
            {stats.totalMinutes}
          </p>
          <p className="text-[0.68rem] text-muted">minutes logged</p>
        </div>
      </section>

      <section className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Workouts this week"
          value={`${stats.workoutsThisWeek}`}
          detail="Workouts since Sunday."
          icon={<Flame className="size-5" />}
          tone="yellow"
        />
        <MetricCard
          label="Total workouts"
          value={`${stats.totalWorkouts}`}
          detail="All logged sessions."
          icon={<Dumbbell className="size-5" />}
          tone="amber"
        />
        <MetricCard
          label="Latest workout"
          value={stats.latestWorkout?.title ?? "--"}
          detail={
            stats.latestWorkout
              ? formatDate(stats.latestWorkout.workout_date)
              : "No workouts yet."
          }
          icon={<CalendarDays className="size-5" />}
          tone="ink"
        />
        <MetricCard
          label="Training minutes"
          value={`${stats.totalMinutes}`}
          detail="Total logged duration."
          icon={<Clock className="size-5" />}
          tone="yellow"
        />
      </section>

      {isLoading ? (
        <FitnessCard>
          <p className="text-sm font-black text-muted">Loading workouts...</p>
        </FitnessCard>
      ) : workouts.length ? (
        <section aria-label="Logged workouts">
          <div className="mb-2 flex items-end justify-between gap-3 sm:mb-4">
            <div>
              <p className="lf-eyebrow">Recent training</p>
              <h2 className="mt-1 font-display text-lg font-black sm:text-xl">
                Workout history
              </h2>
            </div>
            <span className="text-xs font-bold text-muted">
              {workouts.length} total
            </span>
          </div>
          <div className="grid gap-2 sm:gap-4 lg:grid-cols-3">
            {workouts.map((workout) => (
            <FitnessCard key={workout.id} className="!p-3 sm:!p-5">
              <SectionHeader
                eyebrow="Workout"
                title={workout.title}
              />
              <p className="line-clamp-2 text-xs leading-5 text-muted sm:line-clamp-3 sm:text-sm sm:leading-6">
                {workout.notes ?? "No notes for this session yet."}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[0.7rem] font-bold text-muted sm:mt-5 sm:gap-3 sm:text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <CalendarDays className="size-4" />
                  {formatDate(workout.workout_date)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <Clock className="size-4" />
                  {workout.duration_minutes ?? 0} min
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
                  <Dumbbell className="size-4" />
                  {workout.exercise_count} exercises
                </span>
              </div>
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 sm:mt-5">
                <Link
                  href={`/workouts/${workout.id}`}
                  className="lf-press inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-950 px-4 text-sm font-black text-white transition hover:bg-accent sm:rounded-2xl"
                >
                  View and edit
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(workout)}
                  disabled={deletingId === workout.id}
                  aria-label={`Delete ${workout.title}`}
                  className="lf-press inline-flex size-11 items-center justify-center rounded-xl border border-strain/25 bg-red-50 text-strain transition sm:w-auto sm:gap-2 sm:rounded-2xl sm:px-4 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="size-4" />
                  <span className="hidden sm:inline">
                    {deletingId === workout.id ? "Deleting..." : "Delete"}
                  </span>
                </button>
              </div>
            </FitnessCard>
            ))}
          </div>
        </section>
      ) : (
        <FitnessCard>
          <div className="rounded-[1.5rem] border border-accent/25 bg-accent/10 p-6">
            <p className="font-display text-xl font-black">
              No workouts logged yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Start with a quick workout or choose a suggested training plan.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/workouts/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-stone-950"
              >
                <Plus className="size-4" />
                Log workout
              </Link>
              <Link
                href="/training-plan"
                className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white/65 px-5 py-3 text-sm font-black transition hover:border-accent"
              >
                Training plan
              </Link>
            </div>
          </div>
        </FitnessCard>
      )}
    </div>
  );
}
