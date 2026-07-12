"use client";

import { platformLabel, type HealthSummary } from "@/src/lib/health/queries";
import type { Readiness } from "@/src/lib/performance/readiness";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const readinessColors = {
  primed: "var(--accent)",
  ready: "var(--ready)",
  steady: "var(--caution)",
  recover: "var(--strain)",
} as const;

function ReadinessRing({ readiness }: { readiness: Readiness }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - readiness.score / 100);
  const color = readinessColors[readiness.state];

  return (
    <div
      className="relative size-[7.25rem] shrink-0"
      role="img"
      aria-label={`Readiness ${readiness.score} out of 100 — ${readiness.headline}`}
    >
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="8"
        />
        <circle
          className="lf-ring-arc"
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ "--lf-ring-start": circumference } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="lf-num font-display text-[2.35rem] font-black leading-none">
            {readiness.score}
          </p>
          <p className="lf-eyebrow mt-1 !text-[0.56rem]">Readiness</p>
        </div>
      </div>
    </div>
  );
}

export function ReadinessPanel({
  readiness,
  health,
}: {
  readiness: Readiness;
  health: HealthSummary;
}) {
  const [showComponents, setShowComponents] = useState(false);
  const readinessColor = readinessColors[readiness.state];

  return (
    <section
      className="lf-rise lf-rise-1 lf-panel relative overflow-hidden p-4 sm:p-5"
      style={{
        backgroundImage: `radial-gradient(28rem 12rem at 85% -20%, color-mix(in srgb, ${readinessColor} 10%, transparent), transparent)`,
      }}
    >
      <div className="flex items-center gap-4 sm:gap-6">
        <ReadinessRing readiness={readiness} />
        <div className="min-w-0 flex-1">
          <p className="lf-eyebrow" style={{ color: readinessColor }}>
            Performance state
          </p>
          <p className="mt-1 font-display text-2xl font-black tracking-tight sm:text-3xl">
            {readiness.headline}
          </p>
          <p className="mt-1 text-sm leading-snug text-muted">
            {readiness.guidance}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setShowComponents((current) => !current)}
        aria-expanded={showComponents}
        className="lf-press mt-3 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-bold text-muted transition hover:text-foreground"
      >
        {showComponents ? "Hide breakdown" : "What drives this?"}
        <ChevronDown
          className={`size-3.5 transition-transform ${showComponents ? "rotate-180" : ""}`}
        />
      </button>
      {showComponents ? (
        <div className="lf-fade mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {readiness.components.map((component) => (
            <div key={component.label} className="lf-inset p-3">
              <div className="flex items-center justify-between">
                <p className="text-[0.7rem] font-bold text-muted">
                  {component.label}
                </p>
                <p className="lf-num text-sm font-black">{component.score}</p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${component.score}%`,
                    background: readinessColor,
                  }}
                />
              </div>
              <p className="mt-2 text-[0.68rem] leading-snug text-muted">
                {component.detail}
              </p>
            </div>
          ))}
          <p className="col-span-2 text-[0.65rem] leading-snug text-ink-dim sm:col-span-4">
            {health.connection
              ? `Guidance from your logged training and data synced from ${platformLabel(health.connection.platform)} — not a medical measurement.`
              : "Guidance from your logged training, sleep habits, and consistency — not a medical measurement."}
          </p>
        </div>
      ) : null}
    </section>
  );
}
