"use client";

import { useMemo, type FC } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { LegendItem, LegendTones } from "@/components/ui/legend-item";
import { SectionCard } from "@/components/ui/section-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getDashboardPeriodDescription } from "@/config/constants/dropdowns/dashboard/dashboard-period-description.options";
import { TimeBuckets, type TimeBucket, type TimeseriesPoint } from "@/features/analytics/interfaces/analytics.interfaces";
import { formatBucketAxisLabel, formatBucketTitle } from "@/features/analytics/utils/timeseries.utils";
import type { DashboardPeriod } from "@/features/dashboard/interfaces/dashboard.interfaces";
import { formatNumber } from "@/lib/format";

interface CallsOverTimeCardProps {
  period: DashboardPeriod;
  bucket: TimeBucket;
  points: TimeseriesPoint[];
  previousPoints: TimeseriesPoint[];
}

const chartConfig = {
  current: { label: "This period", color: "var(--primary)" },
  previous: { label: "Previous period", color: "var(--color-muted-soft)" },
} satisfies ChartConfig;

/** Hourly views keep only the hours in which anything happened, so quiet nights do not squash the chart. */
function activeRange(points: TimeseriesPoint[], previousPoints: TimeseriesPoint[], bucket: TimeBucket) {
  if (bucket !== TimeBuckets.HOUR) return { start: 0, end: points.length - 1 };
  const active = points
    .map((point, index) => (point.calls > 0 || (previousPoints[index]?.calls ?? 0) > 0 ? index : -1))
    .filter((index) => index >= 0);
  return active.length ? { start: active[0], end: active[active.length - 1] } : { start: 0, end: -1 };
}

export const CallsOverTimeCard: FC<CallsOverTimeCardProps> = ({ period, bucket, points, previousPoints }) => {
  const { currentLabel, previousLabel } = getDashboardPeriodDescription(period);
  const unit = bucket === TimeBuckets.HOUR ? "hour" : "day";

  const rows = useMemo(() => {
    const { start, end } = activeRange(points, previousPoints, bucket);
    return points.slice(start, end + 1).map((point, offset) => ({
      id: point.bucket_start,
      label: formatBucketAxisLabel(point.bucket_start, bucket),
      title: formatBucketTitle(point.bucket_start, bucket),
      current: point.calls,
      previous: previousPoints[start + offset]?.calls ?? 0,
    }));
  }, [points, previousPoints, bucket]);

  return (
    <SectionCard
      title="Calls over time"
      description={`Calls per ${unit}`}
      className="h-full"
      actions={
        <div className="flex items-center gap-4">
          <LegendItem tone={LegendTones.INK}>{currentLabel}</LegendItem>
          <LegendItem tone={LegendTones.LINE}>{previousLabel}</LegendItem>
        </div>
      }
    >
      {rows.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No calls in this period yet.</p>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-60 w-full"
          role="img"
          aria-label={`Bar chart of calls per ${unit}, compared with ${previousLabel.toLowerCase()}`}
        >
          <ComposedChart data={rows} margin={{ left: 0, right: 0, top: 8 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
            <YAxis width={32} tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.title}
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {name === "current" ? currentLabel : previousLabel}
                      </span>
                      <span className="font-mono font-medium tabular-nums">{formatNumber(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Line
              dataKey="previous"
              type="monotone"
              stroke="var(--color-previous)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ChartContainer>
      )}
    </SectionCard>
  );
};
