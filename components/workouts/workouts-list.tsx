"use client";

import {
  FitnessCard,
  MetricCard,
  SectionHeader,
} from "@/components/ui/fitness-card";
import {
  deleteWorkout,
  fetchWorkouts,
  type WorkoutListItem,
} from "@/src/lib/workouts/queries";
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
            Track your sessions, exercises, notes, and progress over time.
          </p>
        </div>
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white shadow-lg shadow-teal-900/15"
          >
            <Plus className="size-4" />
            New workout
          </Link>
        </div>
      </section>

      {notice ? (
        <p className="rounded-[1.5rem] border border-line bg-[#eaf3dd] p-4 text-sm font-black text-accent-strong">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-[1.5rem] border border-red-100 bg-red-50 p-4 text-sm font-black text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="This week"
          value={`${stats.workoutsThisWeek}`}
          detail="Workouts since Sunday."
          icon={<Flame className="size-5" />}
          tone="teal"
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
          tone="teal"
        />
      </section>

      {isLoading ? (
        <FitnessCard>
          <p className="text-sm font-black text-muted">Loading workouts...</p>
        </FitnessCard>
      ) : workouts.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {workouts.map((workout) => (
            <FitnessCard key={workout.id}>
              <SectionHeader
                eyebrow="Workout"
                title={workout.title}
              />
              <p className="line-clamp-3 text-sm leading-6 text-muted">
                {workout.notes ?? "No notes for this session yet."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-muted">
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2">
                  <CalendarDays className="size-4" />
                  {formatDate(workout.workout_date)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2">
                  <Clock className="size-4" />
                  {workout.duration_minutes ?? 0} min
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2">
                  <Dumbbell className="size-4" />
                  {workout.exercise_count} exercises
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/workouts/${workout.id}`}
                  className="rounded-2xl bg-stone-950 px-4 py-2 text-sm font-black text-white transition hover:bg-accent"
                >
                  View/Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(workout)}
                  disabled={deletingId === workout.id}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-black text-red-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 className="size-4" />
                  {deletingId === workout.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </FitnessCard>
          ))}
        </div>
      ) : (
        <FitnessCard>
          <div className="rounded-[1.5rem] bg-[#eaf3dd] p-6">
            <p className="font-display text-xl font-black">
              No workouts logged yet.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Create your first workout and this page will become your training
              timeline.
            </p>
            <Link
              href="/workouts/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-black text-white"
            >
              <Plus className="size-4" />
              Add workout
            </Link>
          </div>
        </FitnessCard>
      )}
    </div>
  );
}
