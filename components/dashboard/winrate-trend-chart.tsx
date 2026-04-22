"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WinRateTrendPoint } from "@/types/domain";

interface WinrateTrendChartProps {
  data: WinRateTrendPoint[];
}

export function WinrateTrendChart({ data }: WinrateTrendChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="winrateFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="dayLabel" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} domain={[35, 70]} width={34} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#101626",
              border: "1px solid #1f2937",
              borderRadius: "0.5rem",
              color: "#e2e8f0",
            }}
            formatter={(value: number, name: string) => [name === "winRate" ? `${value}%` : value, name]}
          />
          <Area type="monotone" dataKey="winRate" stroke="#38bdf8" strokeWidth={2} fill="url(#winrateFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
