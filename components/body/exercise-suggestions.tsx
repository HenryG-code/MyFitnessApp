import {
  getExerciseGuidesForMuscle,
  type ExerciseGuide,
} from "@/src/lib/performance/exercise-guides";
import type { MuscleGroupId } from "@/src/lib/performance/muscles";
import { ChevronDown, Dumbbell, Lightbulb, PlayCircle } from "lucide-react";

function ExerciseMedia({ exercise }: { exercise: ExerciseGuide }) {
  if (!exercise.media) {
    return (
      <div className="grid aspect-video place-items-center rounded-xl border border-dashed border-line bg-black/20 text-center">
        <div>
          <PlayCircle className="mx-auto size-7 text-ink-dim" />
          <p className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-ink-dim">
            Demo slot
          </p>
          <p className="mt-0.5 text-[0.65rem] text-muted">
            GIF or short video coming later
          </p>
        </div>
      </div>
    );
  }

  if (exercise.media.type === "video") {
    return (
      <video
        controls
        muted
        playsInline
        preload="metadata"
        poster={exercise.media.poster}
        aria-label={exercise.media.alt}
        className="aspect-video w-full rounded-xl border border-line bg-black object-cover"
      >
        <source src={exercise.media.src} />
      </video>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={exercise.media.src}
      alt={exercise.media.alt}
      loading="lazy"
      className="aspect-video w-full rounded-xl border border-line bg-black object-cover"
    />
  );
}

export function ExerciseSuggestions({
  muscleId,
  muscleName,
}: {
  muscleId: MuscleGroupId;
  muscleName: string;
}) {
  const exercises = getExerciseGuidesForMuscle(muscleId);

  return (
    <section
      id="exercise-suggestions"
      className="lf-fade lf-panel scroll-mt-4 p-4 sm:p-5"
      aria-labelledby="exercise-suggestions-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-strong">
          <Dumbbell className="size-5" />
        </span>
        <div>
          <p className="lf-eyebrow text-accent-strong">Train this area</p>
          <h2
            id="exercise-suggestions-title"
            className="mt-0.5 font-display text-xl font-black tracking-tight sm:text-2xl"
          >
            Suggested {muscleName.toLowerCase()} exercises
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
            Start light, move under control, and stop if you feel sharp pain.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {exercises.map((exercise) => (
          <article
            key={exercise.name}
            className="overflow-hidden rounded-2xl border border-line bg-white/[0.025] p-3 sm:p-4"
          >
            <ExerciseMedia exercise={exercise} />
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-black">
                  {exercise.name}
                </h3>
                <p className="mt-0.5 text-xs font-bold text-accent-strong">
                  {exercise.prescription}
                </p>
              </div>
              <span className="rounded-full border border-line px-2.5 py-1 text-[0.62rem] font-black text-muted">
                {exercise.difficulty}
              </span>
            </div>
            <p className="mt-2 text-xs font-semibold text-muted">
              Equipment: {exercise.equipment}
            </p>

            <details className="group mt-3 rounded-xl border border-line bg-black/15">
              <summary className="lf-press flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-black">
                How to do it
                <ChevronDown className="size-4 text-muted transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-line px-3 pb-3 pt-3">
                <ol className="space-y-2.5">
                  {exercise.steps.map((step, index) => (
                    <li key={step} className="flex gap-2.5">
                      <span className="lf-num grid size-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[0.65rem] font-black text-accent-strong">
                        {index + 1}
                      </span>
                      <span className="text-xs leading-5 text-muted">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 flex items-start gap-2 rounded-lg border border-caution/20 bg-caution/[0.06] p-2.5 text-xs font-semibold leading-5 text-caution">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
                  {exercise.formCue}
                </p>
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
