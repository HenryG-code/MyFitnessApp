"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";

type WeeklyProgressPoint = {
  day: string;
  consistencyScore: number;
  habitScore: number;
  workoutScore: number;
  weightScore: number;
};

export function WeeklyProgressChart({
  data,
}: {
  data: WeeklyProgressPoint[];
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
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="#2a2a33" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: "rgba(0, 229, 255, 0.1)" }}
            contentStyle={{
              background: "#18181f",
              color: "#f8fafc",
              border: "1px solid #2a2a33",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          />
          <Bar
            dataKey="consistencyScore"
            fill="#00e5ff"
            radius={[10, 10, 0, 0]}
            name="Consistency"
            unit="%"
          />
          <Line
            type="monotone"
            dataKey="habitScore"
            stroke="#a855f7"
            strokeWidth={3}
            dot={{ fill: "#a855f7", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6 }}
            name="Habits"
            unit="%"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
