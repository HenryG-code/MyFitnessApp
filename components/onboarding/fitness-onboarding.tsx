"use client";

import { FitnessCard } from "@/components/ui/fitness-card";
import { getTrainingPlanByGoal } from "@/src/lib/training-plans/data";
import {
  saveTrainingGoalToStorage,
  saveTrainingLevelToStorage,
} from "@/src/lib/training-plans/storage";
import {
  defaultTrainingGoal,
  defaultTrainingLevel,
  trainingGoals,
  trainingLevels,
  type TrainingGoal,
  type TrainingLevel,
} from "@/src/lib/training-plans/types";
import { updateTrainingPlanSelection } from "@/src/lib/user-preferences/queries";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";

const goalDetails: Record<
  TrainingGoal,
  { detail: string; icon: ComponentType<{ className?: string }> }
> = {
  "Lose weight": {
    detail: "Burn energy while keeping strength and recovery balanced.",
    icon: Flame,
  },
  "Gain muscle": {
    detail: "Build muscle with progressive strength and enough recovery.",
    icon: Dumbbell,
  },
  "Get fit": {
    detail: "Improve total-body strength, cardio, mobility, and consistency.",
    icon: Sparkles,
  },
  "Build strength": {
    detail: "Focus training around stronger compound movement patterns.",
    icon: Trophy,
  },
  "Improve cardio": {
    detail: "Develop aerobic fitness, stamina, and a stronger engine.",
    icon: HeartPulse,
  },
  "General health": {
    detail: "Create a sustainable mix of movement, strength, and recovery.",
    icon: ShieldCheck,
  },
};

const levelDetails: Record<TrainingLevel, { title: string; detail: string }> = {
  Beginner: {
    title: "I’m building consistency",
    detail: "A four-day schedule with more recovery and approachable progressions.",
  },
  Intermediate: {
    title: "I train consistently",
    detail: "A five-day schedule with more volume and focused sessions.",
  },
};

export function FitnessOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [goal, setGoal] = useState<TrainingGoal>(defaultTrainingGoal);
  const [level, setLevel] = useState<TrainingLevel>(defaultTrainingLevel);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const plan = getTrainingPlanByGoal(goal, level);
  const nextWorkout = plan.days[0];

  async function finishOnboarding() {
    setIsSaving(true);
    setError("");

    try {
      await updateTrainingPlanSelection(goal, level);
      saveTrainingGoalToStorage(goal);
      saveTrainingLevelToStorage(level);
      router.replace("/training-plan?welcome=1");
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save your recommended plan."
      );
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-background px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto min-w-0 max-w-5xl">
        <header className="flex min-w-0 items-center justify-between gap-3 px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-[0_10px_30px_rgba(240,71,46,0.24)]">
              <TrendingUp className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black">LogFit</p>
              <p className="truncate text-[0.65rem] font-bold text-muted">
                Your personal training direction
              </p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-black text-muted">
            Step {step} of 2
          </span>
        </header>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-sun transition-all duration-500"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>

        {step === 1 ? (
          <section className="mt-6 sm:mt-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.16em] text-accent-strong">
                <Target className="size-3.5" />
                Start with your goal
              </span>
              <h1 className="mt-4 font-display text-3xl font-black leading-[1.02] tracking-tight sm:text-5xl">
                What do you want your training to change?
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Pick the outcome that matters most right now. You can change it
                later from the Training Plan page.
              </p>
            </div>

            <div className="mt-5 grid min-w-0 grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-3 sm:gap-4">
              {trainingGoals.map((option) => {
                const detail = goalDetails[option];
                const Icon = detail.icon;
                const active = goal === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGoal(option)}
                    aria-pressed={active}
                    className={`lf-press min-w-0 rounded-xl border p-3 text-left transition sm:min-h-44 sm:rounded-2xl sm:p-5 ${
                      active
                        ? "border-accent bg-accent/12 shadow-[0_0_0_1px_rgba(240,71,46,0.2),0_20px_60px_rgba(0,0,0,0.28)]"
                        : "border-line bg-card/75"
                    }`}
                  >
                    <span className={`grid size-9 place-items-center rounded-xl sm:size-11 ${active ? "bg-accent text-white" : "bg-white/[0.06] text-muted"}`}>
                      {active ? <Check className="size-5" /> : <Icon className="size-5" />}
                    </span>
                    <span className="mt-3 block font-display text-sm font-black leading-tight sm:text-lg">
                      {option}
                    </span>
                    <span className="mt-1.5 hidden text-xs leading-5 text-muted sm:block">
                      {detail.detail}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="lf-press mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-black text-white shadow-[0_14px_40px_rgba(240,71,46,0.22)] sm:ml-auto sm:mt-7 sm:w-auto sm:min-w-48 sm:rounded-2xl"
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </section>
        ) : (
          <section className="mt-6 sm:mt-10">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="lf-press inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 text-xs font-black text-muted"
            >
              <ArrowLeft className="size-4" />
              Change goal
            </button>

            <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-6">
              <div className="min-w-0">
                <p className="lf-eyebrow">Your experience</p>
                <h1 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  What feels honest today?
                </h1>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This sets the weekly training load. It is a starting point,
                  not a judgment of your ability.
                </p>
                <div className="mt-4 space-y-2">
                  {trainingLevels.map((option) => {
                    const active = level === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setLevel(option)}
                        aria-pressed={active}
                        className={`lf-press flex min-h-24 w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-left sm:rounded-2xl sm:p-4 ${
                          active
                            ? "border-accent bg-accent/10"
                            : "border-line bg-card/70"
                        }`}
                      >
                        <span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${active ? "bg-accent text-white" : "bg-white/[0.06] text-muted"}`}>
                          {active ? <Check className="size-4" /> : <Dumbbell className="size-4" />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black sm:text-base">
                            {levelDetails[option].title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-muted">
                            {levelDetails[option].detail}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <FitnessCard className="min-w-0 border-accent/25 !p-4 sm:!p-6">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="lf-eyebrow !text-accent-strong">Recommended for you</p>
                    <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">
                      {plan.title}
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                      {plan.description}
                    </p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-white">
                    <Sparkles className="size-5" />
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="lf-inset min-w-0 p-3">
                    <p className="text-[0.6rem] font-black uppercase tracking-wider text-muted">Schedule</p>
                    <p className="mt-1 font-display text-lg font-black">{plan.days.length} days</p>
                  </div>
                  <div className="lf-inset min-w-0 p-3">
                    <p className="text-[0.6rem] font-black uppercase tracking-wider text-muted">Level</p>
                    <p className="mt-1 font-display text-lg font-black">{level}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-line bg-white/[0.025] p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.62rem] font-black uppercase tracking-wider text-accent-strong">Your first workout</p>
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-muted">
                      <Clock className="size-3.5" />
                      {nextWorkout.durationMinutes} min
                    </span>
                  </div>
                  <p className="mt-1 font-display text-lg font-black">{nextWorkout.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {nextWorkout.exercises.slice(0, 3).map((exercise) => exercise.name).join(" · ")}
                  </p>
                </div>

                {error ? (
                  <p className="mt-3 rounded-xl border border-strain/25 bg-red-50 p-3 text-xs font-bold text-strain">
                    {error}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => void finishOnboarding()}
                  disabled={isSaving}
                  className="lf-press mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white shadow-[0_14px_40px_rgba(240,71,46,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving your plan…" : "Use this as my plan"}
                  {!isSaving ? <ArrowRight className="size-4" /> : null}
                </button>
              </FitnessCard>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
