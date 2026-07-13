"use client";

import {
  BODY_VIEWBOX,
  BodySculpture,
  frontShapes,
  rearShapes,
  type BodyView,
} from "@/components/body/body-model";
import { ExerciseSuggestions } from "@/components/body/exercise-suggestions";
import {
  analyzeBodyIntelligence,
  fetchDatedExercises,
  type BodyIntelligence,
  type MuscleGroupId,
  type MuscleGroupStatus,
  type MuscleState,
} from "@/src/lib/performance/muscles";
import { ArrowDownRight, ArrowUpRight, RotateCcw, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// three.js loads only on this page, and only when WebGL is available.
const BodyScene = dynamic(
  () => import("@/components/body/body-scene").then((mod) => mod.BodyScene),
  {
    ssr: false,
    loading: () => (
      <div className="size-full animate-pulse rounded-[1.25rem] bg-white/[0.04]" />
    ),
  }
);

const stateColors: Record<MuscleState, string> = {
  fresh: "var(--accent)",
  recovering: "var(--caution)",
  ready: "var(--ready)",
  neglected: "rgba(255,255,255,0.14)",
};

const stateLabels: Record<MuscleState, string> = {
  fresh: "Just trained",
  recovering: "Recovering",
  ready: "Ready",
  neglected: "Undertrained",
};

function BodyMap({
  view,
  intelligence,
  selected,
  onSelect,
  active,
}: {
  view: BodyView;
  intelligence: BodyIntelligence;
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId) => void;
  active: boolean;
}) {
  const shapes = view === "front" ? frontShapes : rearShapes;

  return (
    <svg
      viewBox={BODY_VIEWBOX}
      role="group"
      aria-label={`${view === "front" ? "Front" : "Rear"} body muscle map`}
      aria-hidden={!active}
      className="mx-auto h-full max-h-[27rem] w-auto max-w-full drop-shadow-[0_22px_24px_rgba(0,0,0,0.52)]"
    >
      <BodySculpture view={view} />
      {shapes.map((shape, index) => {
        const status = intelligence.groups[shape.id];
        const color = stateColors[status.state];
        const isSelected = selected === shape.id;
        const Element = shape.el;

        return (
          <Element
            key={`${shape.id}-${index}`}
            {...shape.attrs}
            className="lf-muscle"
            fill={color}
            fillOpacity={status.state === "neglected" ? 0.16 : 0.42}
            stroke={isSelected ? "var(--foreground)" : color}
            strokeOpacity={isSelected ? 1 : 0.6}
            strokeWidth={isSelected ? 2.4 : 1.1}
            filter={`url(#muscle-glow-${view})`}
            style={{ color }}
            tabIndex={active ? 0 : -1}
            role="button"
            aria-label={`${status.name}: ${stateLabels[status.state]}, ${status.weeklySets} sets this week`}
            onClick={() => onSelect(shape.id)}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(shape.id);
              }
            }}
          >
            <title>{`${status.name} — ${stateLabels[status.state]} · ${status.weeklySets} sets this week`}</title>
          </Element>
        );
      })}
    </svg>
  );
}

function MuscleDetail({
  status,
  onClose,
}: {
  status: MuscleGroupStatus;
  onClose: () => void;
}) {
  const [minTarget, maxTarget] = status.targetRange;
  const setsTrend = status.weeklySets - status.previousWeeklySets;
  const volumePercent = Math.min(
    100,
    Math.round((status.weeklySets / maxTarget) * 100)
  );

  return (
    <div className="lf-panel p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-black tracking-tight">
              {status.name}
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-black uppercase tracking-wider"
              style={{
                color: stateColors[status.state],
                background: `color-mix(in srgb, ${stateColors[status.state]} 14%, transparent)`,
              }}
            >
              {stateLabels[status.state]}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">
            {status.lastTrained
              ? status.daysSinceTrained === 0
                ? "Last trained today"
                : `Last trained ${status.daysSinceTrained} day${status.daysSinceTrained === 1 ? "" : "s"} ago`
              : "No sessions mapped in the last 4 weeks"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="lf-press grid size-9 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="lf-inset p-3">
          <p className="lf-eyebrow !text-[0.58rem]">Weekly sets</p>
          <p className="lf-num mt-1 flex items-baseline gap-1 font-display text-xl font-black">
            {status.weeklySets}
            {setsTrend !== 0 ? (
              <span
                className={`flex items-center text-[0.65rem] font-bold ${setsTrend > 0 ? "text-ready" : "text-caution"}`}
              >
                {setsTrend > 0 ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(setsTrend)}
              </span>
            ) : null}
          </p>
        </div>
        <div className="lf-inset p-3">
          <p className="lf-eyebrow !text-[0.58rem]">Target</p>
          <p className="lf-num mt-1 font-display text-xl font-black">
            {minTarget}–{maxTarget}
          </p>
        </div>
        <div className="lf-inset p-3">
          <p className="lf-eyebrow !text-[0.58rem]">Recovery</p>
          <p className="lf-num mt-1 font-display text-xl font-black">
            {status.lastTrained ? `${status.recoveryPercent}%` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[0.68rem] font-bold text-muted">
          <span>Volume vs target band</span>
          <span className="lf-num">
            {status.weeklySets}/{maxTarget}
          </span>
        </div>
        <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="absolute inset-y-0 rounded-full bg-white/[0.1]"
            style={{
              left: `${(minTarget / maxTarget) * 100}%`,
              right: 0,
            }}
          />
          <div
            className="relative h-full rounded-full transition-all"
            style={{
              width: `${volumePercent}%`,
              background: stateColors[status.state],
            }}
          />
        </div>
        <p className="mt-1.5 text-[0.68rem] font-semibold text-muted">
          {status.weeklySets < minTarget
            ? `${minTarget - status.weeklySets} more set${minTarget - status.weeklySets === 1 ? "" : "s"} to reach the weekly target band.`
            : status.weeklySets > maxTarget
              ? "Above the target band — factor in recovery."
              : "Inside the productive weekly band."}
        </p>
      </div>

      {status.topExercises.length ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="lf-eyebrow !text-[0.58rem]">Driven by</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {status.topExercises.map((exercise) => (
              <span
                key={exercise}
                className="rounded-full border border-line bg-white/[0.04] px-2.5 py-1 text-[0.68rem] font-bold text-muted"
              >
                {exercise}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BodyIntelligencePage() {
  const [view, setView] = useState<BodyView>("front");
  const [viewRevision, setViewRevision] = useState(0);
  const [selected, setSelected] = useState<MuscleGroupId | null>(null);
  const dragStartX = useRef<number | null>(null);
  const [intelligence, setIntelligence] = useState<BodyIntelligence | null>(
    null
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchDatedExercises(28)
      .then(({ exercises }) => {
        if (isMounted) {
          setIntelligence(analyzeBodyIntelligence(exercises));
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load body data."
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

  const selectedStatus = useMemo(
    () => (selected && intelligence ? intelligence.groups[selected] : null),
    [selected, intelligence]
  );

  // The SVG map remains as the fallback for devices without WebGL.
  const [hasWebGL, setHasWebGL] = useState(() => {
    if (typeof document === "undefined") return true;

    try {
      const canvas = document.createElement("canvas");
      return Boolean(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl")
      );
    } catch {
      return false;
    }
  });
  const [hoveredStatus, setHoveredStatus] = useState<MuscleGroupStatus | null>(
    null
  );

  function rotateBody(nextView?: BodyView) {
    setView((current) => nextView ?? (current === "front" ? "rear" : "front"));
    setViewRevision((current) => current + 1);
  }

  function handleModelPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
  }

  function handleModelPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const startX = dragStartX.current;
    dragStartX.current = null;

    if (startX === null) {
      return;
    }

    const distance = event.clientX - startX;

    if (Math.abs(distance) >= 36) {
      rotateBody(distance < 0 ? "rear" : "front");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-[26rem] animate-pulse rounded-[1.25rem] bg-white/[0.045]" />
      </div>
    );
  }

  if (error || !intelligence) {
    return (
      <p className="lf-panel mx-auto max-w-4xl p-5 text-sm font-bold text-strain">
        {error || "Could not load body data."}
      </p>
    );
  }

  const hasData = intelligence.totalWeeklySets > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <header className="lf-rise flex items-end justify-between gap-3">
        <div>
          <p className="lf-eyebrow">Body intelligence</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            Training map
          </h1>
        </div>
        <div
          role="tablist"
          aria-label="Body view"
          className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1"
        >
          {(["front", "rear"] as BodyView[]).map((option) => (
            <button
              key={option}
              role="tab"
              type="button"
              aria-selected={view === option}
              onClick={() => rotateBody(option)}
              className={`lf-press rounded-lg px-4 py-1.5 text-xs font-bold capitalize transition ${
                view === option
                  ? "bg-white/[0.09] text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <div className="lf-rise lf-rise-1 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <section className="lf-panel relative isolate overflow-hidden border-white/[0.08] bg-[radial-gradient(circle_at_50%_24%,rgba(240,71,46,0.13),transparent_32%),linear-gradient(150deg,rgba(255,255,255,0.045),rgba(255,255,255,0.008)_48%,rgba(0,0,0,0.2))] p-4 shadow-[0_36px_100px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="pointer-events-none absolute inset-x-[12%] top-14 -z-10 h-64 rounded-full bg-accent/[0.055] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-10 bottom-16 -z-10 h-16 rounded-[50%] bg-black/70 blur-xl" />
          <div className="relative flex items-center justify-between">
            <p className="lf-num text-xs font-bold text-muted">
              {intelligence.totalWeeklySets} sets · 7 days
            </p>
            {intelligence.mostWorked ? (
              <p className="text-xs font-bold text-muted">
                Focus: {intelligence.mostWorked.name}
              </p>
            ) : null}
          </div>
          <div
            role="region"
            tabIndex={0}
            aria-label={`Interactive 3D body, showing ${view}. Drag horizontally or use arrow keys to rotate.`}
            onPointerDown={hasWebGL ? undefined : handleModelPointerDown}
            onPointerUp={hasWebGL ? undefined : handleModelPointerUp}
            onPointerCancel={() => {
              dragStartX.current = null;
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                rotateBody("front");
              }

              if (event.key === "ArrowRight") {
                event.preventDefault();
                rotateBody("rear");
              }
            }}
            className="relative mt-2 h-[24rem] touch-pan-y select-none outline-none [perspective:1100px] focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-[26rem]"
          >
            {hasWebGL ? (
              <BodyScene
                intelligence={intelligence}
                view={view}
                selected={selected}
                onSelect={(id) =>
                  setSelected((current) => (current === id ? null : id))
                }
                onHover={(id) =>
                  setHoveredStatus(id ? intelligence.groups[id] : null)
                }
                onUnavailable={() => setHasWebGL(false)}
                viewRevision={viewRevision}
              />
            ) : (
              <div
                className="relative size-full cursor-grab transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.2,1)] [transform-style:preserve-3d] active:cursor-grabbing motion-reduce:transition-none"
                style={{
                  transform: `rotateY(${view === "front" ? 0 : 180}deg)`,
                }}
              >
                <div className="absolute inset-0 [backface-visibility:hidden]">
                  <BodyMap
                    view="front"
                    active={view === "front"}
                    intelligence={intelligence}
                    selected={selected}
                    onSelect={(id) =>
                      setSelected((current) => (current === id ? null : id))
                    }
                  />
                </div>
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <BodyMap
                    view="rear"
                    active={view === "rear"}
                    intelligence={intelligence}
                    selected={selected}
                    onSelect={(id) =>
                      setSelected((current) => (current === id ? null : id))
                    }
                  />
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
              {hoveredStatus ? (
                <span className="lf-fade rounded-full border border-white/[0.1] bg-black/60 px-3 py-1 text-[0.62rem] font-black text-foreground backdrop-blur">
                  {hoveredStatus.name} · {stateLabels[hoveredStatus.state]} ·{" "}
                  <span className="lf-num">{hoveredStatus.weeklySets} sets</span>
                </span>
              ) : (
                <span className="rounded-full border border-white/[0.08] bg-black/45 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-muted backdrop-blur">
                  {view} view
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => rotateBody()}
            className="lf-press mx-auto mt-1 flex items-center gap-2 rounded-full border border-line bg-black/25 px-3 py-1.5 text-[0.68rem] font-bold text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            {hasWebGL ? "Drag to spin · tap a muscle" : "Drag or tap to rotate"}
          </button>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {(
              ["fresh", "recovering", "ready", "neglected"] as MuscleState[]
            ).map((state) => (
              <span
                key={state}
                className="flex items-center gap-1.5 text-[0.65rem] font-bold text-muted"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: stateColors[state] }}
                />
                {stateLabels[state]}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {selectedStatus ? (
            <div className="lf-fade">
              <MuscleDetail
                status={selectedStatus}
                onClose={() => setSelected(null)}
              />
            </div>
          ) : (
            <div className="lf-panel p-4 sm:p-5">
              {hasData ? (
                <>
                  <p className="lf-eyebrow">This week</p>
                  <div className="mt-3 space-y-2">
                    {(Object.values(intelligence.groups) as MuscleGroupStatus[])
                      .filter((group) => group.weeklySets > 0)
                      .sort((a, b) => b.weeklySets - a.weeklySets)
                      .slice(0, 6)
                      .map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => setSelected(group.id)}
                          className="lf-press flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left"
                        >
                          <span className="w-24 shrink-0 text-xs font-bold">
                            {group.name}
                          </span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                            <span
                              className="block h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (group.weeklySets / group.targetRange[1]) * 100)}%`,
                                background: stateColors[group.state],
                              }}
                            />
                          </span>
                          <span className="lf-num w-7 shrink-0 text-right text-xs font-black">
                            {group.weeklySets}
                          </span>
                        </button>
                      ))}
                  </div>
                  {intelligence.neglected.length ? (
                    <p className="mt-4 rounded-xl border border-caution/20 bg-caution/[0.07] p-3 text-xs font-semibold leading-relaxed text-caution">
                      Undertrained:{" "}
                      {intelligence.neglected
                        .map((group) => group.name)
                        .join(", ")}
                    </p>
                  ) : null}
                  <p className="mt-3 text-[0.68rem] leading-snug text-ink-dim">
                    Tap a muscle group on the map for volume, recovery, and the
                    exercises driving it.
                  </p>
                </>
              ) : (
                <div className="py-4 text-center">
                  <p className="font-display text-lg font-black">
                    No mapped training yet
                  </p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                    Log workouts with named exercises and LogFit will map them
                    onto your body automatically.
                  </p>
                  <Link
                    href="/workouts/live"
                    className="lf-press mt-4 inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-black text-white transition hover:bg-accent-strong"
                  >
                    Start a session
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {selectedStatus ? (
        <ExerciseSuggestions
          key={selectedStatus.id}
          muscleId={selectedStatus.id}
          muscleName={selectedStatus.name}
        />
      ) : null}
    </div>
  );
}
