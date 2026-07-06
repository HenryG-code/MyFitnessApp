"use client";

import {
  analyzeBodyIntelligence,
  fetchDatedExercises,
  type BodyIntelligence,
  type MuscleGroupId,
  type MuscleGroupStatus,
  type MuscleState,
} from "@/src/lib/performance/muscles";
import { ArrowDownRight, ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type BodyView = "front" | "rear";

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

type MuscleShape = {
  id: MuscleGroupId;
  el: "ellipse" | "path" | "circle";
  attrs: Record<string, string | number>;
};

/** Schematic, symmetric muscle plates on a capsule silhouette. viewBox 0 0 220 440. */
const frontShapes: MuscleShape[] = [
  { id: "shoulders", el: "ellipse", attrs: { cx: 70, cy: 88, rx: 13, ry: 11 } },
  { id: "shoulders", el: "ellipse", attrs: { cx: 150, cy: 88, rx: 13, ry: 11 } },
  { id: "chest", el: "path", attrs: { d: "M80,102 Q108,96 108,120 Q108,138 86,134 Q72,128 74,110 Z" } },
  { id: "chest", el: "path", attrs: { d: "M140,102 Q112,96 112,120 Q112,138 134,134 Q148,128 146,110 Z" } },
  { id: "biceps", el: "ellipse", attrs: { cx: 63, cy: 126, rx: 9, ry: 15, transform: "rotate(8 63 126)" } },
  { id: "biceps", el: "ellipse", attrs: { cx: 157, cy: 126, rx: 9, ry: 15, transform: "rotate(-8 157 126)" } },
  { id: "forearms", el: "ellipse", attrs: { cx: 55, cy: 176, rx: 7, ry: 21, transform: "rotate(9 55 176)" } },
  { id: "forearms", el: "ellipse", attrs: { cx: 165, cy: 176, rx: 7, ry: 21, transform: "rotate(-9 165 176)" } },
  { id: "core", el: "path", attrs: { d: "M94,142 Q110,138 126,142 L124,198 Q110,206 96,198 Z" } },
  { id: "quads", el: "ellipse", attrs: { cx: 93, cy: 264, rx: 15, ry: 42 } },
  { id: "quads", el: "ellipse", attrs: { cx: 127, cy: 264, rx: 15, ry: 42 } },
  { id: "calves", el: "ellipse", attrs: { cx: 90, cy: 362, rx: 9, ry: 27 } },
  { id: "calves", el: "ellipse", attrs: { cx: 130, cy: 362, rx: 9, ry: 27 } },
];

const rearShapes: MuscleShape[] = [
  { id: "traps", el: "path", attrs: { d: "M92,76 L110,66 L128,76 L120,100 L100,100 Z" } },
  { id: "shoulders", el: "ellipse", attrs: { cx: 70, cy: 88, rx: 13, ry: 11 } },
  { id: "shoulders", el: "ellipse", attrs: { cx: 150, cy: 88, rx: 13, ry: 11 } },
  { id: "back", el: "path", attrs: { d: "M84,104 Q110,96 136,104 L132,156 Q110,172 88,156 Z" } },
  { id: "triceps", el: "ellipse", attrs: { cx: 63, cy: 128, rx: 9, ry: 16, transform: "rotate(8 63 128)" } },
  { id: "triceps", el: "ellipse", attrs: { cx: 157, cy: 128, rx: 9, ry: 16, transform: "rotate(-8 157 128)" } },
  { id: "forearms", el: "ellipse", attrs: { cx: 55, cy: 176, rx: 7, ry: 21, transform: "rotate(9 55 176)" } },
  { id: "forearms", el: "ellipse", attrs: { cx: 165, cy: 176, rx: 7, ry: 21, transform: "rotate(-9 165 176)" } },
  { id: "glutes", el: "circle", attrs: { cx: 97, cy: 216, r: 16 } },
  { id: "glutes", el: "circle", attrs: { cx: 123, cy: 216, r: 16 } },
  { id: "hamstrings", el: "ellipse", attrs: { cx: 93, cy: 280, rx: 14, ry: 38 } },
  { id: "hamstrings", el: "ellipse", attrs: { cx: 127, cy: 280, rx: 14, ry: 38 } },
  { id: "calves", el: "ellipse", attrs: { cx: 90, cy: 356, rx: 10, ry: 29 } },
  { id: "calves", el: "ellipse", attrs: { cx: 130, cy: 356, rx: 10, ry: 29 } },
];

function BodySilhouette() {
  return (
    <g fill="rgba(255,255,255,0.035)" stroke="rgba(255,255,255,0.07)" strokeWidth="1">
      <circle cx="110" cy="36" r="19" />
      <rect x="100" y="54" width="20" height="14" rx="5" />
      <rect x="74" y="66" width="72" height="150" rx="26" />
      <rect x="46" y="80" width="20" height="140" rx="10" transform="rotate(7 56 150)" />
      <rect x="154" y="80" width="20" height="140" rx="10" transform="rotate(-7 164 150)" />
      <rect x="80" y="212" width="26" height="216" rx="13" />
      <rect x="114" y="212" width="26" height="216" rx="13" />
    </g>
  );
}

function BodyMap({
  view,
  intelligence,
  selected,
  onSelect,
}: {
  view: BodyView;
  intelligence: BodyIntelligence;
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId) => void;
}) {
  const shapes = view === "front" ? frontShapes : rearShapes;

  return (
    <svg
      viewBox="0 0 220 440"
      role="group"
      aria-label={`${view === "front" ? "Front" : "Rear"} body muscle map`}
      className="mx-auto h-full max-h-[26rem] w-auto"
    >
      <BodySilhouette />
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
            fillOpacity={status.state === "neglected" ? 0.5 : 0.55}
            stroke={isSelected ? "var(--foreground)" : color}
            strokeOpacity={isSelected ? 0.9 : 0.5}
            strokeWidth={isSelected ? 2 : 1}
            tabIndex={0}
            role="button"
            aria-label={`${status.name}: ${stateLabels[status.state]}, ${status.weeklySets} sets this week`}
            onClick={() => onSelect(shape.id)}
            onKeyDown={(event: React.KeyboardEvent) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(shape.id);
              }
            }}
          />
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
  const [selected, setSelected] = useState<MuscleGroupId | null>(null);
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
              onClick={() => setView(option)}
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
        <section className="lf-panel relative p-4">
          <div className="flex items-center justify-between">
            <p className="lf-num text-xs font-bold text-muted">
              {intelligence.totalWeeklySets} sets · 7 days
            </p>
            {intelligence.mostWorked ? (
              <p className="text-xs font-bold text-muted">
                Focus: {intelligence.mostWorked.name}
              </p>
            ) : null}
          </div>
          <div className="mt-2 h-[22rem] sm:h-[24rem]">
            <BodyMap
              view={view}
              intelligence={intelligence}
              selected={selected}
              onSelect={(id) =>
                setSelected((current) => (current === id ? null : id))
              }
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
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
    </div>
  );
}
