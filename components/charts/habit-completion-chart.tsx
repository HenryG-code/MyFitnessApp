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
    return <div className="h-64 w-full rounded-[1.5rem] bg-stone-100" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#e8e1d4" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            domain={[0, 100]}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: "rgba(15, 118, 110, 0.08)" }}
            contentStyle={{
              border: "1px solid #e4ded0",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(23,33,28,0.12)",
            }}
          />
          <Bar
            dataKey="percentage"
            fill="#0f766e"
            name="Completion"
            radius={[10, 10, 0, 0]}
            unit="%"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
