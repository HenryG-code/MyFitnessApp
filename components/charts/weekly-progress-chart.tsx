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

type WeeklyProgressPoint = {
  day: string;
  workouts: number;
  habits: number;
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
    return <div className="h-64 w-full rounded-[1.5rem] bg-stone-100" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="#e8e1d4" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
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
            dataKey="habits"
            fill="#f2b705"
            radius={[10, 10, 0, 0]}
            name="Habit completion"
            unit="%"
          />
          <Bar
            dataKey="workouts"
            fill="#0f766e"
            radius={[10, 10, 0, 0]}
            name="Workouts"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
