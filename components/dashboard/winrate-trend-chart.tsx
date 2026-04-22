"use client";

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WinRateTrendPoint } from "@/types/domain";

interface WinrateTrendChartProps {
  data: WinRateTrendPoint[];
  /** When true, overlays ACS as a secondary line. */
  showAcs?: boolean;
}

export function WinrateTrendChart({ data, showAcs = false }: WinrateTrendChartProps) {
  if (showAcs) {
    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
            <CartesianGrid stroke="hsl(var(--border) / 0.4)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="dayLabel"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="wr"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={[35, 70]}
              width={34}
            />
            <YAxis
              yAxisId="acs"
              orientation="right"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={[180, 260]}
              width={34}
            />
            <Tooltip content={<ChartTooltip showAcs />} cursor={{ stroke: "hsl(var(--border))" }} />
            <Line
              yAxisId="wr"
              type="monotone"
              dataKey="winRate"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2.25}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="acs"
              type="monotone"
              dataKey="avgAcs"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2.25}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="winrateFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="hsl(var(--border) / 0.4)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="dayLabel"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[35, 70]}
            width={34}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
          <Area
            type="monotone"
            dataKey="winRate"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2.25}
            fill="url(#winrateFill)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload, label, showAcs }: any) {
  if (!active || !payload?.length) return null;
  const wr = payload.find((p: any) => p.dataKey === "winRate");
  const acs = payload.find((p: any) => p.dataKey === "avgAcs");
  return (
    <div className="rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-soft backdrop-blur">
      <p className="font-medium text-foreground">{label}</p>
      {wr ? (
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(var(--chart-1))" }} />
          Win rate
          <span className="ml-auto font-mono text-foreground">{wr.value}%</span>
        </p>
      ) : null}
      {showAcs && acs ? (
        <p className="mt-1 flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: "hsl(var(--chart-2))" }} />
          Avg ACS
          <span className="ml-auto font-mono text-foreground">{acs.value}</span>
        </p>
      ) : null}
    </div>
  );
}
