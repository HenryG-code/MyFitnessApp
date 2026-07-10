"use client";

import {
  analyzeBodyIntelligence,
  fetchDatedExercises,
  type BodyIntelligence,
  type MuscleGroupId,
  type MuscleGroupStatus,
  type MuscleState,
} from "@/src/lib/performance/muscles";
import { ArrowDownRight, ArrowUpRight, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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

/** Symmetric muscle plates on the front of the sculpted model. */
const frontShapes: MuscleShape[] = [
  { id: "shoulders", el: "path", attrs: { d: "M75 77 C61 75 51 84 52 98 C55 106 63 110 74 106 C82 100 84 88 75 77Z" } },
  { id: "shoulders", el: "path", attrs: { d: "M145 77 C159 75 169 84 168 98 C165 106 157 110 146 106 C138 100 136 88 145 77Z" } },
  { id: "chest", el: "path", attrs: { d: "M78 96 C88 86 102 87 108 96 L108 126 C96 137 78 133 72 119 C69 108 72 101 78 96Z" } },
  { id: "chest", el: "path", attrs: { d: "M142 96 C132 86 118 87 112 96 L112 126 C124 137 142 133 148 119 C151 108 148 101 142 96Z" } },
  { id: "biceps", el: "path", attrs: { d: "M54 109 C44 117 44 137 50 150 C55 156 64 152 68 141 C71 128 67 114 60 109Z" } },
  { id: "biceps", el: "path", attrs: { d: "M166 109 C176 117 176 137 170 150 C165 156 156 152 152 141 C149 128 153 114 160 109Z" } },
  { id: "forearms", el: "path", attrs: { d: "M48 153 C41 161 39 188 44 207 C48 214 55 211 59 200 L61 166 C59 156 54 152 48 153Z" } },
  { id: "forearms", el: "path", attrs: { d: "M172 153 C179 161 181 188 176 207 C172 214 165 211 161 200 L159 166 C161 156 166 152 172 153Z" } },
  { id: "core", el: "path", attrs: { d: "M88 135 C96 132 104 134 110 140 C116 134 124 132 132 135 L128 195 C124 207 116 214 110 216 C104 214 96 207 92 195Z" } },
  { id: "quads", el: "path", attrs: { d: "M82 220 C75 237 76 286 83 310 C89 320 101 315 106 300 L106 234 C101 221 91 216 82 220Z" } },
  { id: "quads", el: "path", attrs: { d: "M138 220 C145 237 144 286 137 310 C131 320 119 315 114 300 L114 234 C119 221 129 216 138 220Z" } },
  { id: "calves", el: "path", attrs: { d: "M84 323 C77 340 78 378 84 394 C89 401 98 396 101 384 L100 339 C96 325 90 320 84 323Z" } },
  { id: "calves", el: "path", attrs: { d: "M136 323 C143 340 142 378 136 394 C131 401 122 396 119 384 L120 339 C124 325 130 320 136 323Z" } },
];

const rearShapes: MuscleShape[] = [
  { id: "traps", el: "path", attrs: { d: "M91 70 L110 61 L129 70 L137 95 C126 101 119 105 110 112 C101 105 94 101 83 95Z" } },
  { id: "shoulders", el: "path", attrs: { d: "M75 77 C61 75 51 84 52 98 C55 106 63 110 74 106 C82 100 84 88 75 77Z" } },
  { id: "shoulders", el: "path", attrs: { d: "M145 77 C159 75 169 84 168 98 C165 106 157 110 146 106 C138 100 136 88 145 77Z" } },
  { id: "back", el: "path", attrs: { d: "M80 97 C91 91 101 95 110 108 C119 95 129 91 140 97 C146 117 142 155 131 178 C124 188 116 193 110 194 C104 193 96 188 89 178 C78 155 74 117 80 97Z" } },
  { id: "triceps", el: "path", attrs: { d: "M54 109 C44 118 44 139 51 154 C57 158 65 151 68 138 C69 124 65 112 59 109Z" } },
  { id: "triceps", el: "path", attrs: { d: "M166 109 C176 118 176 139 169 154 C163 158 155 151 152 138 C151 124 155 112 161 109Z" } },
  { id: "forearms", el: "path", attrs: { d: "M48 155 C41 164 39 189 44 207 C48 214 55 211 59 200 L61 168 C59 158 54 154 48 155Z" } },
  { id: "forearms", el: "path", attrs: { d: "M172 155 C179 164 181 189 176 207 C172 214 165 211 161 200 L159 168 C161 158 166 154 172 155Z" } },
  { id: "glutes", el: "path", attrs: { d: "M82 197 C92 190 104 194 109 205 L107 230 C100 242 84 240 78 227 C76 216 77 204 82 197Z" } },
  { id: "glutes", el: "path", attrs: { d: "M138 197 C128 190 116 194 111 205 L113 230 C120 242 136 240 142 227 C144 216 143 204 138 197Z" } },
  { id: "hamstrings", el: "path", attrs: { d: "M82 235 C76 252 77 290 84 313 C90 321 101 315 105 300 L105 248 C100 235 90 230 82 235Z" } },
  { id: "hamstrings", el: "path", attrs: { d: "M138 235 C144 252 143 290 136 313 C130 321 119 315 115 300 L115 248 C120 235 130 230 138 235Z" } },
  { id: "calves", el: "path", attrs: { d: "M84 323 C77 340 78 378 84 394 C89 401 98 396 101 384 L100 339 C96 325 90 320 84 323Z" } },
  { id: "calves", el: "path", attrs: { d: "M136 323 C143 340 142 378 136 394 C131 401 122 396 119 384 L120 339 C124 325 130 320 136 323Z" } },
];

function BodyModelDefs({ view }: { view: BodyView }) {
  const suffix = view === "front" ? "front" : "rear";

  return (
    <defs>
      <linearGradient id={`body-skin-${suffix}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#19191d" />
        <stop offset="0.22" stopColor="#3b3b42" />
        <stop offset="0.48" stopColor="#1f2025" />
        <stop offset="0.72" stopColor="#4a4a52" />
        <stop offset="1" stopColor="#141418" />
      </linearGradient>
      <radialGradient id={`body-glow-${suffix}`} cx="42%" cy="28%" r="70%">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.24" />
        <stop offset="0.42" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.32" />
      </radialGradient>
      <filter id={`model-shadow-${suffix}`} x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#000000" floodOpacity="0.72" />
      </filter>
      <filter id={`muscle-glow-${suffix}`} x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="currentColor" floodOpacity="0.42" />
      </filter>
    </defs>
  );
}

function BodySilhouette({ view }: { view: BodyView }) {
  const suffix = view === "front" ? "front" : "rear";
  const fill = `url(#body-skin-${suffix})`;

  return (
    <g filter={`url(#model-shadow-${suffix})`}>
      <ellipse cx="110" cy="425" rx="52" ry="8" fill="#000" opacity="0.55" />
      <g fill={fill} stroke="rgba(255,255,255,0.11)" strokeWidth="1.1" strokeLinejoin="round">
        <ellipse cx="110" cy="35" rx="18" ry="22" />
        <path d="M99 54 C101 63 98 68 91 72 L110 86 L129 72 C122 68 119 63 121 54Z" />
        <path d="M88 68 C70 67 59 72 51 85 C46 94 48 105 55 111 C62 113 68 109 73 104 C76 133 79 166 87 190 C92 203 99 212 110 216 C121 212 128 203 133 190 C141 166 144 133 147 104 C152 109 158 113 165 111 C172 105 174 94 169 85 C161 72 150 67 132 68 L110 81Z" />
        <path d="M53 100 C43 111 40 136 43 157 L39 194 C38 207 43 218 50 220 C58 219 61 210 61 199 L64 160 C71 142 70 119 63 106Z" />
        <path d="M167 100 C177 111 180 136 177 157 L181 194 C182 207 177 218 170 220 C162 219 159 210 159 199 L156 160 C149 142 150 119 157 106Z" />
        <path d="M87 187 C80 199 77 215 79 230 C82 240 91 245 103 242 L110 232 L117 242 C129 245 138 240 141 230 C143 215 140 199 133 187Z" />
        <path d="M81 228 C74 248 76 287 80 310 C82 319 82 326 79 340 L80 390 C80 409 88 418 99 414 C104 406 103 392 102 380 L105 320 C111 292 110 255 103 236Z" />
        <path d="M139 228 C146 248 144 287 140 310 C138 319 138 326 141 340 L140 390 C140 409 132 418 121 414 C116 406 117 392 118 380 L115 320 C109 292 110 255 117 236Z" />
        <path d="M80 391 C73 404 68 417 72 424 C81 429 94 427 101 419 L99 405Z" />
        <path d="M140 391 C147 404 152 417 148 424 C139 429 126 427 119 419 L121 405Z" />
      </g>
      <path d="M110 13 C102 15 97 22 96 35 C98 48 103 54 110 57Z" fill="rgba(255,255,255,0.09)" />
      <path d="M110 82 C94 76 78 76 68 88 C80 92 91 96 110 103Z" fill="rgba(255,255,255,0.055)" />
      <path d="M110 82 C126 76 142 76 152 88 C140 92 129 96 110 103Z" fill="rgba(0,0,0,0.2)" />
      <path d="M85 190 C94 201 102 207 110 210 L110 231 L102 241 C91 243 83 237 81 228Z" fill="rgba(255,255,255,0.045)" />
      <path d="M110 12 C132 46 120 145 110 216 C104 291 106 363 110 421" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {view === "front" ? (
        <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1">
          <path d="M81 120 C91 127 101 127 108 123 M112 123 C119 127 129 127 139 120" />
          <path d="M96 151 L108 151 M112 151 L124 151 M96 170 L108 170 M112 170 L124 170 M98 188 L108 188 M112 188 L122 188" />
        </g>
      ) : (
        <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1">
          <path d="M76 104 C87 116 93 137 91 169 M144 104 C133 116 127 137 129 169" />
          <path d="M110 75 L110 191" />
        </g>
      )}
      <path d="M53 100 C43 126 47 175 44 201 M167 100 C177 126 173 175 176 201 M81 232 C89 270 84 319 82 390 M139 232 C131 270 136 319 138 390" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
      <path d="M54 87 C79 62 95 79 110 81 C125 79 141 62 166 87" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />
      <path d="M54 88 C79 67 95 81 110 83 C125 81 141 67 166 88 L160 108 C139 97 129 95 110 102 C91 95 81 97 60 108Z" fill={`url(#body-glow-${suffix})`} opacity="0.48" />
    </g>
  );
}

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
      viewBox="0 0 220 440"
      role="group"
      aria-label={`${view === "front" ? "Front" : "Rear"} body muscle map`}
      aria-hidden={!active}
      className="mx-auto h-full max-h-[27rem] w-auto drop-shadow-[0_22px_24px_rgba(0,0,0,0.52)]"
    >
      <BodyModelDefs view={view} />
      <BodySilhouette view={view} />
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
            fillOpacity={status.state === "neglected" ? 0.34 : 0.68}
            stroke={isSelected ? "var(--foreground)" : color}
            strokeOpacity={isSelected ? 1 : 0.72}
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

  function rotateBody(nextView?: BodyView) {
    setView((current) => nextView ?? (current === "front" ? "rear" : "front"));
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
            onPointerDown={handleModelPointerDown}
            onPointerUp={handleModelPointerUp}
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
            className="relative mt-2 h-[24rem] cursor-grab touch-pan-y select-none outline-none [perspective:1100px] active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-accent/60 sm:h-[26rem]"
          >
            <div className="pointer-events-none absolute left-1/2 top-[46%] h-[19rem] w-[12rem] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/[0.055] shadow-[0_0_70px_rgba(240,71,46,0.08),inset_0_0_55px_rgba(255,255,255,0.025)]" />
            <div
              className="relative size-full transition-transform duration-700 ease-[cubic-bezier(0.22,0.8,0.2,1)] [transform-style:preserve-3d] motion-reduce:transition-none"
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
            <div className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center">
              <span className="rounded-full border border-white/[0.08] bg-black/45 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-muted backdrop-blur">
                {view} view
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => rotateBody()}
            className="lf-press mx-auto mt-1 flex items-center gap-2 rounded-full border border-line bg-black/25 px-3 py-1.5 text-[0.68rem] font-bold text-muted transition hover:border-accent/40 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            Drag or tap to rotate
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
    </div>
  );
}
