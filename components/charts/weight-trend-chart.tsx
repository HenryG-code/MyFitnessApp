"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";

type WeightPoint = {
  date: string;
  weight: number;
};

export function WeightTrendChart({ data }: { data: WeightPoint[] }) {
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
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickLine={false}
            tick={{ fill: "#69746f", fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #e4ded0",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(23,33,28,0.12)",
            }}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#0f766e"
            strokeWidth={4}
            dot={{ fill: "#f2b705", strokeWidth: 0, r: 5 }}
            activeDot={{ r: 7 }}
            name="Weight"
            unit=" kg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
