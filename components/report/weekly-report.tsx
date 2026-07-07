"use client";

import {
  buildHabitChartData,
  fetchHabitDefinitions,
  fetchRecentHabitCompletions,
} from "@/src/lib/habits/queries";
import { fetchHealthSummary } from "@/src/lib/health/queries";
import { fetchDatedExercises } from "@/src/lib/performance/muscles";
import {
  buildWeeklyReport,
  type WeeklyReport,
} from "@/src/lib/performance/report";
import { fetchWeightLogs } from "@/src/lib/weight/queries";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const pages = ["The week", "The numbers", "Highlights", "Next week"] as const;

export function WeeklyReportPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchDatedExercises(14),
      fetchWeightLogs(),
      fetchHabitDefinitions({ activeOnly: true }),
      fetchRecentHabitCompletions(14),
      fetchHealthSummary(),
    ])
      .then(([dated, weights, definitions, completions, health]) => {
        if (isMounted) {
          setReport(
            buildWeeklyReport({
              workouts: dated.workouts,
              weights,
              habitDays: buildHabitChartData(definitions, completions, 14),
              exercises: dated.exercises,
              healthDays: health.recent,
            })
          );
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not build the report."
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

  const canPrev = page > 0;
  const canNext = page < pages.length - 1;

  const handlers = useMemo(
    () => ({
      onTouchStart: (event: React.TouchEvent) => {
        touchStartX.current = event.touches[0].clientX;
      },
      onTouchEnd: (event: React.TouchEvent) => {
        if (touchStartX.current === null) {
          return;
        }

        const delta = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;

        if (delta < -48 && canNext) {
          setPage((current) => current + 1);
        } else if (delta > 48 && canPrev) {
          setPage((current) => current - 1);
        }
      },
    }),
    [canNext, canPrev]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <div className="h-7 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="h-80 animate-pulse rounded-[1.25rem] bg-white/[0.05]" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <p className="lf-panel mx-auto max-w-2xl p-5 text-sm font-bold text-strain">
        {error || "Could not build the report."}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <header className="lf-rise flex items-end justify-between">
        <div>
          <p className="lf-eyebrow">Performance review</p>
          <h1 className="mt-1 font-display text-[1.55rem] font-black leading-tight tracking-tight sm:text-3xl">
            {report.weekLabel}
          </h1>
        </div>
        <p className="lf-num text-xs font-bold text-muted">
          {page + 1}/{pages.length}
        </p>
      </header>

      {/* Progress dots */}
      <div className="lf-rise lf-rise-1 flex gap-1.5" aria-hidden="true">
        {pages.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setPage(index)}
            className={`h-1 flex-1 rounded-full transition-all ${
              index <= page ? "bg-accent" : "bg-white/[0.09]"
            }`}
            aria-label={`Go to ${label}`}
          />
        ))}
      </div>

      <section
        {...handlers}
        className="lf-rise lf-rise-2 lf-panel min-h-[22rem] p-5 sm:p-6"
        aria-live="polite"
      >
        {page === 0 ? (
          <div key="p0" className="lf-fade flex h-full flex-col">
            <p className="lf-eyebrow text-accent-strong">{pages[0]}</p>
            <div className="mt-4 space-y-3">
              {report.narrative.map((line) => (
                <p
                  key={line}
                  className="font-display text-xl font-bold leading-snug sm:text-2xl"
                >
                  {line}
                </p>
              ))}
            </div>
            <p className="lf-num mt-auto pt-6 text-xs font-bold text-muted">
              {report.daysActive} active day{report.daysActive === 1 ? "" : "s"}{" "}
              this week
            </p>
          </div>
        ) : null}

        {page === 1 ? (
          <div key="p1" className="lf-fade">
            <p className="lf-eyebrow text-accent-strong">{pages[1]}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {report.deltas.map((delta) => (
                <div key={delta.label} className="lf-inset p-3.5">
                  <p className="lf-eyebrow !text-[0.6rem]">{delta.label}</p>
                  <p className="lf-num mt-1.5 font-display text-2xl font-black">
                    {delta.current}
                  </p>
                  {delta.change ? (
                    <p
                      className={`mt-1 flex items-center gap-0.5 text-[0.7rem] font-bold ${
                        delta.direction === "flat"
                          ? "text-muted"
                          : delta.positive
                            ? "text-ready"
                            : "text-caution"
                      }`}
                    >
                      {delta.direction === "up" ? (
                        <ArrowUpRight className="size-3" />
                      ) : delta.direction === "down" ? (
                        <ArrowDownRight className="size-3" />
                      ) : null}
                      {delta.change}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {page === 2 ? (
          <div key="p2" className="lf-fade space-y-4">
            <p className="lf-eyebrow text-accent-strong">{pages[2]}</p>
            <div className="rounded-xl border border-ready/25 bg-ready/[0.07] p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ready">
                <Trophy className="size-4" />
                Biggest win
              </p>
              <p className="mt-2 font-display text-2xl font-black leading-tight">
                {report.biggestWin.title}
              </p>
              <p className="mt-1 text-sm font-medium text-muted">
                {report.biggestWin.detail}
              </p>
            </div>
            {report.watchItem ? (
              <div className="rounded-xl border border-caution/25 bg-caution/[0.06] p-4">
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-caution">
                  <Eye className="size-4" />
                  Watch this
                </p>
                <p className="mt-2 font-display text-xl font-black leading-tight">
                  {report.watchItem.title}
                </p>
                <p className="mt-1 text-sm font-medium text-muted">
                  {report.watchItem.detail}
                </p>
              </div>
            ) : (
              <p className="rounded-xl border border-line p-4 text-sm font-semibold text-muted">
                Nothing flagged this week. Clean execution.
              </p>
            )}
          </div>
        ) : null}

        {page === 3 ? (
          <div key="p3" className="lf-fade flex h-full flex-col">
            <p className="lf-eyebrow text-accent-strong">{pages[3]}</p>
            <div className="mt-4 rounded-xl border border-accent/25 bg-accent/[0.07] p-4">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent-strong">
                <Target className="size-4" />
                Focus
              </p>
              <p className="mt-2 font-display text-2xl font-black leading-tight">
                {report.nextFocus.title}
              </p>
              <p className="mt-1 text-sm font-medium text-muted">
                {report.nextFocus.detail}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="lf-press mt-auto flex h-12 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-black text-white transition hover:bg-accent-strong"
            >
              Back to today
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </section>

      {/* Pager */}
      <div className="lf-rise lf-rise-3 flex items-center justify-between">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => setPage((current) => current - 1)}
          className="lf-press flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-muted transition hover:text-foreground disabled:opacity-30"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => setPage((current) => current + 1)}
          className="lf-press flex items-center gap-1.5 rounded-xl bg-white/[0.08] px-4 py-2.5 text-sm font-black transition hover:bg-white/[0.14] disabled:opacity-30"
        >
          Next
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
