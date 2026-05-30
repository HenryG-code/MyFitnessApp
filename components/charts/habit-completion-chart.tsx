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
  percentage: number;
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
    return <div className="h-64 w-full rounded-[1.5rem] bg-surface" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#2a2a24" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="date"
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
            cursor={{ fill: "rgba(250, 204, 21, 0.1)" }}
            contentStyle={{
              background: "#1a1a18",
              color: "#f8f7f2",
              border: "1px solid #2a2a24",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          />
          <Bar
            dataKey="percentage"
            fill="#facc15"
            name="Completion"
            radius={[10, 10, 0, 0]}
            unit="%"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
