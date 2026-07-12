"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";

export type HabitCompletionPoint = {
  date: string;
  dayLabel: string;
  displayDate: string;
  percentage: number;
  completed: number;
  total: number;
};

export function HabitCompletionChart({
  data,
}: {
  data: HabitCompletionPoint[];
}) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="h-56 w-full min-w-0 max-w-full rounded-[1.5rem] bg-surface sm:h-64" />;
  }

  return (
    <div className="h-56 w-full min-w-0 max-w-full overflow-hidden sm:h-64">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#2a2a33" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            domain={[0, 100]}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: "rgba(220, 38, 38, 0.12)" }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as
                | HabitCompletionPoint
                | undefined;

              if (!active || !point) {
                return null;
              }

              return (
                <div className="rounded-[1.1rem] border border-line bg-stone-950 px-4 py-3 text-sm shadow-2xl shadow-black/40">
                  <p className="font-black text-white">
                    {point.displayDate}: {point.percentage}% complete
                  </p>
                  <p className="mt-1 font-bold text-muted">
                    {point.total
                      ? `${point.completed} of ${point.total} habits`
                      : "No active habits"}
                  </p>
                </div>
              );
            }}
            contentStyle={{
              background: "#18181f",
              color: "#f8fafc",
              border: "1px solid #2a2a33",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          />
          <Bar
            dataKey="percentage"
            fill="#dc2626"
            name="Completion"
            radius={[10, 10, 0, 0]}
            unit="%"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
