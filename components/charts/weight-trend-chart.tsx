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
  logged_at: string;
  weight_kg: number;
};

export function WeightTrendChart({ data }: { data: WeightPoint[] }) {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="h-[18rem] w-full rounded-[1.5rem] bg-surface sm:h-[20rem] lg:h-[24rem]" />
    );
  }

  return (
    <div className="h-[18rem] w-full min-w-0 sm:h-[20rem] lg:h-[24rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 18, left: 0, bottom: 8 }}
        >
          <XAxis
            dataKey="logged_at"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
            tickLine={false}
            tick={{ fill: "#a8a29e", fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip
            contentStyle={{
              background: "#18181f",
              color: "#f8fafc",
              border: "1px solid #2a2a33",
              borderRadius: "18px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          />
          <Line
            type="monotone"
            dataKey="weight_kg"
            stroke="#dc2626"
            strokeWidth={4}
            dot={{ fill: "#f97316", strokeWidth: 0, r: 5 }}
            activeDot={{ r: 7 }}
            name="Weight"
            unit=" kg"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
