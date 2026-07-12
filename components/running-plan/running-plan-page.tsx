"use client";

import { FitnessCard } from "@/components/ui/fitness-card";
import {
  completeRunningSession,
  getRunningWeek,
} from "@/src/lib/running-plans/plan";
import {
  loadRunningPlan,
  logRunningSession,
  saveRunningPlan,
  startRunningPlan,
} from "@/src/lib/running-plans/queries";
import type {
  RunningEffort,
  RunningExperience,
  RunningPlanState,
  RunningSession,
} from "@/src/lib/running-plans/types";
import {
  ArrowRight,
  CalendarRange,
  Check,
  ChevronRight,
  Flag,
  Footprints,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const experiences: Array<{
  id: RunningExperience;
  label: string;
  detail: string;
}> = [
  { id: "starting", label: "Starting out", detail: "Run-walk or under 1 km" },
  { id: "building", label: "Building", detail: "Comfortable around 2 km" },
  { id: "regular", label: "Regular runner", detail: "Comfortable around 5 km" },
];

const effortOptions: Array<{
  id: RunningEffort;
  label: string;
  detail: string;
}> = [
  { id: "comfortable", label: "Felt good", detail: "I had more in the tank" },
  { id: "challenging", label: "Challenging", detail: "Hard, but controlled" },
  { id: "too-hard", label: "Too hard", detail: "I struggled to finish" },
];

function formatDistance(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function RunningSetup({
  onStart,
  isSaving,
  error,
}: {
  onStart: (goalKm: number, experience: RunningExperience) => Promise<void>;
  isSaving: boolean;
  error: string;
}) {
  const [goalKm, setGoalKm] = useState(5);
  const [experience, setExperience] =
    useState<RunningExperience>("starting");

  return (
    <div className="min-w-0 space-y-3 overflow-x-clip sm:space-y-5">
      <section className="lf-panel relative min-w-0 overflow-hidden p-4 sm:p-7">
        <div className="absolute -right-16 -top-20 size-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-accent-strong">
              <Sparkles className="size-3.5" />
              Adaptive running coach
            </span>
            <h1 className="mt-4 max-w-xl font-display text-3xl font-black leading-[0.98] tracking-tight sm:text-5xl">
              Build your distance, one smart run at a time.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
              Choose a finish-line distance. Your coach creates three manageable
              runs each week and adjusts the next step from how training feels.
            </p>
          </div>
          <span className="grid size-16 place-items-center rounded-2xl bg-accent text-white shadow-[0_18px_60px_rgba(240,71,46,0.28)] sm:size-24 sm:rounded-[2rem]">
            <Footprints className="size-8 sm:size-11" />
          </span>
        </div>
      </section>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] sm:gap-5">
        <FitnessCard className="min-w-0 !p-3 sm:!p-5">
          <p className="lf-eyebrow">Your finish line</p>
          <h2 className="mt-1 font-display text-xl font-black sm:text-2xl">
            How far do you want to run?
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[3, 5, 10].map((distance) => (
              <button
                key={distance}
                type="button"
                onClick={() => setGoalKm(distance)}
                className={`lf-press min-h-20 rounded-xl border p-2 text-center transition sm:min-h-24 sm:rounded-2xl ${
                  goalKm === distance
                    ? "border-accent bg-accent/12 shadow-[0_0_0_1px_rgba(240,71,46,0.24)]"
                    : "border-line bg-white/[0.025]"
                }`}
              >
                <span className="lf-num block font-display text-2xl font-black sm:text-3xl">
                  {distance}
                </span>
                <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted">
                  kilometres
                </span>
              </button>
            ))}
          </div>
          <label className="mt-3 block rounded-xl border border-line bg-white/[0.025] p-3 sm:rounded-2xl">
            <span className="text-xs font-black text-muted">Custom goal</span>
            <span className="mt-1 flex min-w-0 items-center gap-2">
              <input
                type="number"
                min="2"
                max="42"
                step="0.5"
                inputMode="decimal"
                value={goalKm}
                onChange={(event) => setGoalKm(Number(event.target.value))}
                className="lf-num min-w-0 flex-1 bg-transparent font-display text-2xl font-black outline-none"
                aria-label="Custom running goal in kilometres"
              />
              <span className="shrink-0 text-sm font-black text-muted">km</span>
            </span>
          </label>

          <p className="lf-eyebrow mt-5">Your starting point</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {experiences.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setExperience(option.id)}
                className={`lf-press flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition sm:block sm:min-h-28 sm:rounded-2xl ${
                  experience === option.id
                    ? "border-accent bg-accent/10"
                    : "border-line bg-white/[0.02]"
                }`}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full ${
                    experience === option.id
                      ? "bg-accent text-white"
                      : "bg-white/[0.06] text-muted"
                  }`}
                >
                  {experience === option.id ? (
                    <Check className="size-4" />
                  ) : (
                    <Gauge className="size-4" />
                  )}
                </span>
                <span className="min-w-0 sm:mt-3 sm:block">
                  <span className="block text-sm font-black">{option.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-muted">
                    {option.detail}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </FitnessCard>

        <FitnessCard className="min-w-0 border-accent/20 !p-4 sm:!p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-strong">
              <TrendingUp className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black">How it adapts</p>
              <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
                Three sessions balance fitness, speed, and safe distance gains.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              "Easy run to build your aerobic base",
              "Controlled intervals for stronger pacing",
              "Long easy run toward your next milestone",
            ].map((item, index) => (
              <div key={item} className="lf-inset flex items-center gap-3 p-3">
                <span className="lf-num grid size-7 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-black text-accent-strong">
                  {index + 1}
                </span>
                <p className="min-w-0 text-xs font-bold leading-5">{item}</p>
              </div>
            ))}
          </div>
          {error ? (
            <p className="mt-3 rounded-xl border border-strain/25 bg-red-50 p-3 text-xs font-bold text-strain">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => void onStart(goalKm, experience)}
            disabled={isSaving || !Number.isFinite(goalKm) || goalKm < 2 || goalKm > 42}
            className="lf-press mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white shadow-[0_12px_36px_rgba(240,71,46,0.24)] disabled:cursor-not-allowed disabled:opacity-50 sm:rounded-2xl"
          >
            {isSaving ? "Building your plan…" : `Build my ${formatDistance(goalKm)} km plan`}
            {!isSaving ? <ArrowRight className="size-4" /> : null}
          </button>
          <div className="mt-3 flex items-start gap-2 text-[0.68rem] leading-4 text-muted">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            Start conservatively and stop if you feel pain. This is general
            fitness guidance, not medical advice.
          </div>
        </FitnessCard>
      </div>
    </div>
  );
}

function SessionLogSheet({
  session,
  onClose,
  onSave,
  isSaving,
}: {
  session: RunningSession;
  onClose: () => void;
  onSave: (distance: number, minutes: number, effort: RunningEffort) => Promise<void>;
  isSaving: boolean;
}) {
  const [distance, setDistance] = useState(String(session.distanceKm));
  const [minutes, setMinutes] = useState(String(session.suggestedMinutes));
  const [effort, setEffort] = useState<RunningEffort>("comfortable");

  const canSave =
    Number(distance) > 0 && Number(minutes) > 0 && !isSaving;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close run logger"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] border border-line bg-card p-4 shadow-2xl sm:max-w-lg sm:rounded-[1.75rem] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="lf-eyebrow">Complete run</p>
            <h2 className="mt-1 font-display text-2xl font-black">{session.title}</h2>
            <p className="mt-1 text-xs text-muted">Planned: {session.distanceKm} km</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lf-press grid size-10 shrink-0 place-items-center rounded-full bg-white/[0.06]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="min-w-0 rounded-xl border border-line bg-white/[0.025] p-3">
            <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted">Distance</span>
            <span className="mt-1 flex min-w-0 items-end gap-1">
              <input
                type="number"
                min="0.1"
                step="0.1"
                inputMode="decimal"
                value={distance}
                onChange={(event) => setDistance(event.target.value)}
                className="lf-num min-w-0 flex-1 bg-transparent font-display text-2xl font-black outline-none"
              />
              <span className="pb-1 text-xs font-bold text-muted">km</span>
            </span>
          </label>
          <label className="min-w-0 rounded-xl border border-line bg-white/[0.025] p-3">
            <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted">Time</span>
            <span className="mt-1 flex min-w-0 items-end gap-1">
              <input
                type="number"
                min="1"
                step="1"
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="lf-num min-w-0 flex-1 bg-transparent font-display text-2xl font-black outline-none"
              />
              <span className="pb-1 text-xs font-bold text-muted">min</span>
            </span>
          </label>
        </div>

        <p className="lf-eyebrow mt-5">How did it feel?</p>
        <div className="mt-2 space-y-2">
          {effortOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setEffort(option.id)}
              className={`lf-press flex min-h-14 w-full items-center gap-3 rounded-xl border p-3 text-left ${
                effort === option.id
                  ? "border-accent bg-accent/10"
                  : "border-line bg-white/[0.02]"
              }`}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-full ${effort === option.id ? "bg-accent text-white" : "bg-white/[0.06] text-muted"}`}>
                {effort === option.id ? <Check className="size-4" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">{option.label}</span>
                <span className="block text-xs text-muted">{option.detail}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => void onSave(Number(distance), Number(minutes), effort)}
          disabled={!canSave}
          className="lf-press mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="size-4" />
          {isSaving ? "Saving run…" : "Save run and adapt plan"}
        </button>
      </section>
    </div>
  );
}

function ActiveRunningPlan({
  plan,
  onPlanChange,
  onReset,
}: {
  plan: RunningPlanState;
  onPlanChange: (state: RunningPlanState) => void;
  onReset: () => void;
}) {
  const week = useMemo(() => getRunningWeek(plan), [plan]);
  const [selectedSession, setSelectedSession] = useState<RunningSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const progress = Math.min(
    100,
    Math.round(
      (((plan.currentWeek - 1) * 3 + plan.completedSessions.length) /
        (week.totalWeeks * 3)) *
        100
    )
  );
  const milestones = Array.from(new Set([3, 5, 10, plan.goalKm]))
    .filter((distance) => distance <= plan.goalKm)
    .sort((a, b) => a - b);

  async function handleComplete(
    distanceKm: number,
    durationMinutes: number,
    effort: RunningEffort
  ) {
    if (!selectedSession) return;

    setIsSaving(true);
    setError("");
    try {
      await logRunningSession({
        plan,
        session: selectedSession,
        distanceKm,
        durationMinutes,
        effort,
      });
      const nextState = completeRunningSession(plan, {
        session: selectedSession,
        actualDistanceKm: distanceKm,
        durationMinutes,
        effort,
      });
      await saveRunningPlan(nextState);
      onPlanChange(nextState);
      setSelectedSession(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this run.");
    } finally {
      setIsSaving(false);
    }
  }

  if (plan.status === "completed") {
    return (
      <div className="min-w-0 overflow-x-clip">
        <section className="lf-panel relative overflow-hidden p-5 text-center sm:p-10">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-accent/20 to-transparent" />
          <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-accent text-white shadow-[0_18px_60px_rgba(240,71,46,0.3)]">
            <Flag className="size-9" />
          </div>
          <p className="lf-eyebrow relative mt-5 text-accent-strong">Goal achieved</p>
          <h1 className="relative mt-1 font-display text-4xl font-black tracking-tight sm:text-6xl">
            {formatDistance(plan.goalKm)} km. You did it.
          </h1>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base">
            You completed {plan.totalRuns} coached runs and earned a stronger
            aerobic base. Your next finish line can start whenever you are ready.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="lf-press relative mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-black text-white"
          >
            Set my next running goal
            <ArrowRight className="size-4" />
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3 overflow-x-clip sm:space-y-5">
      <section className="lf-panel min-w-0 overflow-hidden p-4 sm:p-6">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="lf-eyebrow">Adaptive running coach</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight sm:text-5xl">
              Week {week.week} <span className="text-muted">of {week.totalWeeks}</span>
            </h1>
            <p className="mt-2 text-sm text-muted">
              Building toward your {formatDistance(plan.goalKm)} km finish line
            </p>
          </div>
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-white sm:size-16">
            <Footprints className="size-6 sm:size-8" />
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-xs font-black">
            <span>{progress}% complete</span>
            <span className="text-muted">{plan.totalRuns} runs logged</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-sun transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid min-w-0 gap-2" style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(0, 1fr))` }}>
          {milestones.map((distance) => {
            const reached = week.targetDistanceKm >= distance;
            return (
              <div key={distance} className="min-w-0 text-center">
                <span className={`mx-auto grid size-7 place-items-center rounded-full border text-[0.62rem] font-black ${reached ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted"}`}>
                  {reached ? <Check className="size-3.5" /> : <Flag className="size-3" />}
                </span>
                <span className="mt-1 block truncate text-[0.62rem] font-black text-muted">{formatDistance(distance)} km</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="lf-inset flex min-w-0 items-start gap-3 border border-accent/15 p-3 sm:p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-strong">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black uppercase tracking-wider text-accent-strong">Coach update</p>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{plan.adaptationMessage}</p>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3 px-1">
          <div>
            <p className="lf-eyebrow">This week</p>
            <h2 className="mt-1 font-display text-xl font-black">Three purposeful runs</h2>
          </div>
          <span className="lf-num shrink-0 text-xs font-black text-muted">
            {plan.completedSessions.length}/3 done
          </span>
        </div>

        <div className="mt-3 grid min-w-0 gap-2 lg:grid-cols-3 sm:gap-4">
          {week.sessions.map((session, index) => {
            const isComplete = plan.completedSessions.includes(session.id);
            return (
              <FitnessCard key={session.id} className={`min-w-0 !p-3 sm:!p-4 ${isComplete ? "border-ready/25 opacity-75" : index === plan.completedSessions.length ? "border-accent/35" : ""}`}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`lf-num grid size-10 shrink-0 place-items-center rounded-xl font-display text-lg font-black ${isComplete ? "bg-ready text-stone-950" : "bg-white/[0.06] text-accent-strong"}`}>
                    {isComplete ? <Check className="size-5" /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-black sm:text-lg">{session.title}</p>
                    <p className="mt-0.5 text-[0.68rem] font-bold text-accent-strong">{session.cue}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="lf-inset min-w-0 p-2.5">
                    <p className="text-[0.6rem] font-black uppercase tracking-wider text-muted">Distance</p>
                    <p className="lf-num mt-1 font-display text-xl font-black">{formatDistance(session.distanceKm)} <span className="text-xs text-muted">km</span></p>
                  </div>
                  <div className="lf-inset min-w-0 p-2.5">
                    <p className="text-[0.6rem] font-black uppercase tracking-wider text-muted">Guide</p>
                    <p className="lf-num mt-1 font-display text-xl font-black">{session.suggestedMinutes} <span className="text-xs text-muted">min</span></p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted">{session.description}</p>
                <button
                  type="button"
                  onClick={() => setSelectedSession(session)}
                  disabled={isComplete}
                  className={`lf-press mt-3 inline-flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-sm font-black ${isComplete ? "cursor-default bg-ready/10 text-ready" : "bg-accent text-white"}`}
                >
                  <span>{isComplete ? "Run complete" : "Log this run"}</span>
                  {isComplete ? <Check className="size-4" /> : <ChevronRight className="size-4" />}
                </button>
              </FitnessCard>
            );
          })}
        </div>
      </section>

      {week.milestoneKm ? (
        <section className="lf-panel flex min-w-0 items-center gap-3 border border-sun/20 p-3 sm:p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sun text-stone-950">
            <Flag className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black">Milestone week: {formatDistance(week.milestoneKm)} km</p>
            <p className="mt-0.5 text-xs text-muted">Complete your distance builder to cross this marker.</p>
          </div>
        </section>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-strain/25 bg-red-50 p-3 text-xs font-bold text-strain">{error}</p>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[0.68rem] leading-4 text-muted">
          <CalendarRange className="size-4 shrink-0" />
          Run on non-consecutive days when possible so your body can recover.
        </div>
        <button
          type="button"
          onClick={onReset}
          className="lf-press inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line px-3 text-xs font-black text-muted"
        >
          <RotateCcw className="size-3.5" />
          Change goal
        </button>
      </div>

      {selectedSession ? (
        <SessionLogSheet
          session={selectedSession}
          onClose={() => !isSaving && setSelectedSession(null)}
          onSave={handleComplete}
          isSaving={isSaving}
        />
      ) : null}
    </div>
  );
}

export function RunningPlanPage() {
  const [plan, setPlan] = useState<RunningPlanState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    loadRunningPlan()
      .then((storedPlan) => {
        if (isMounted) setPlan(storedPlan);
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load your running plan.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleStart(goalKm: number, experience: RunningExperience) {
    setIsSaving(true);
    setError("");
    try {
      setPlan(await startRunningPlan(goalKm, experience));
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Could not start your plan.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleReset() {
    if (plan?.status === "active" && !window.confirm("Replace your current running plan with a new goal?")) {
      return;
    }
    setPlan(null);
    setError("");
  }

  if (isLoading) {
    return (
      <div className="lf-panel flex min-h-64 items-center justify-center p-6">
        <div className="text-center">
          <Footprints className="mx-auto size-8 animate-pulse text-accent-strong" />
          <p className="mt-3 text-sm font-black text-muted">Loading your running coach…</p>
        </div>
      </div>
    );
  }

  return plan ? (
    <ActiveRunningPlan plan={plan} onPlanChange={setPlan} onReset={handleReset} />
  ) : (
    <RunningSetup onStart={handleStart} isSaving={isSaving} error={error} />
  );
}
