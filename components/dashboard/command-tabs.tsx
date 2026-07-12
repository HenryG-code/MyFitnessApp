"use client";

import { WeeklyProgressChart } from "@/components/charts/weekly-progress-chart";
import {
  calculateMacroBreakdown,
  calculateTodayMacros,
  calculateWeeklyMacros,
  generateProgressInsights,
  type DashboardData,
  type WeeklyConsistencyPoint,
  type WeeklyWorkoutStats,
} from "@/src/lib/dashboard/queries";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type CommandTab = "overview" | "nutrition" | "insights";

export function CommandTabs({
  data,
  weekly,
  workoutStats,
}: {
  data: DashboardData;
  weekly: WeeklyConsistencyPoint[];
  workoutStats: WeeklyWorkoutStats;
}) {
  const [tab, setTab] = useState<CommandTab>("overview");
  const todayMacros = calculateTodayMacros(data);

  return (
    <section className="lf-rise lf-rise-4">
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-surface p-1"
      >
        {(
          [
            ["overview", "Overview"],
            ["nutrition", "Nutrition"],
            ["insights", "Insights"],
          ] as Array<[CommandTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`lf-press rounded-lg py-2 text-xs font-bold transition sm:text-sm ${
              tab === id
                ? "bg-white/[0.09] text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {tab === "overview" ? (
          <div className="lf-fade space-y-3">
            <div className="lf-panel p-4 sm:p-5">
              <p className="lf-eyebrow mb-3">Weekly rhythm</p>
              <WeeklyProgressChart data={weekly} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { href: "/body", label: "Body map", detail: "Muscle recovery" },
                { href: "/progress", label: "Progress", detail: "Your journey" },
                { href: "/report", label: "Weekly report", detail: "Review the week" },
                { href: "/workouts", label: "History", detail: `${workoutStats.workoutsCompleted} this week` },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="lf-press lf-inset group flex flex-col justify-between gap-2 p-3"
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="flex items-center justify-between text-[0.68rem] font-semibold text-muted">
                    {item.detail}
                    <ArrowRight className="size-3 opacity-0 transition group-hover:opacity-100" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {tab === "nutrition" ? (
          <div className="lf-fade lf-panel p-4 sm:p-5">
            {todayMacros.plannedMeals > 0 ? (
              <>
                <div className="flex items-baseline justify-between">
                  <p className="lf-eyebrow">Planned today</p>
                  <p className="lf-num text-xs font-bold text-muted">
                    {todayMacros.plannedMeals} meals
                  </p>
                </div>
                <p className="lf-num mt-2 font-display text-3xl font-black">
                  {new Intl.NumberFormat("en").format(todayMacros.calories)}
                  <span className="ml-1 text-sm font-bold text-muted">kcal</span>
                </p>
                <div className="mt-4 space-y-2.5">
                  {calculateMacroBreakdown(todayMacros).map((macro) => (
                    <div key={macro.label}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span>{macro.label}</span>
                        <span className="lf-num text-muted">
                          {macro.grams}g · {macro.percentage}%
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-white/[0.03]"
                        role="progressbar"
                        aria-label={`${macro.label}: ${macro.percentage}%`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={macro.percentage}
                      >
                        <div
                          className={`liftlog-progress-bar h-full min-w-1 rounded-full ${macro.barClassName}`}
                          style={{ width: `${macro.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="lf-num mt-4 border-t border-line pt-3 text-xs font-semibold text-muted">
                  Week: {calculateWeeklyMacros(data).plannedMealsCount} meals ·{" "}
                  {new Intl.NumberFormat("en").format(
                    calculateWeeklyMacros(data).weeklyCalories
                  )}{" "}
                  kcal planned
                </p>
              </>
            ) : (
              <div className="py-2 text-center">
                <p className="font-display text-lg font-black">
                  No meals planned today
                </p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                  Plan meals to see calories and macros here.
                </p>
                <Link
                  href="/meal-planner"
                  className="lf-press mt-4 inline-flex rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-bold transition hover:bg-white/[0.12]"
                >
                  Open meal planner
                </Link>
              </div>
            )}
          </div>
        ) : null}

        {tab === "insights" ? (
          <div className="lf-fade space-y-2">
            {generateProgressInsights(data).map((insight) => (
              <div
                key={insight}
                className="lf-inset flex items-start gap-3 p-3.5"
              >
                <Sparkles className="mt-0.5 size-4 shrink-0 text-accent-strong" />
                <p className="text-sm font-semibold leading-snug">{insight}</p>
              </div>
            ))}
            <Link
              href="/report"
              className="lf-press flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-muted transition hover:text-foreground"
            >
              Open weekly report
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
