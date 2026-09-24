"use client";

import { useMemo, useState, type FC } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { LegendItem, type LegendTone } from "@/components/ui/legend-item";
import { SectionCard } from "@/components/ui/section-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  ChartViewFormOptions,
  ChartViews,
  type ChartView,
} from "@/config/constants/dropdowns/analytics/chart-view-form.options";
import {
  TimeBuckets,
  type TimeBucket,
  type TimeseriesPoint,
} from "@/features/analytics/interfaces/analytics.interfaces";
import { formatBucketAxisLabel, formatBucketTitle } from "@/features/analytics/utils/timeseries.utils";

type SeriesKey = "successful_calls" | "unsuccessful_calls" | "ai_cost" | "telephony_cost";

interface SeriesDefinition {
  key: SeriesKey;
  label: string;
  /** Ink for the primary series, quiet gray for the secondary one. */
  tone: Extract<LegendTone, "ink" | "muted">;
}

interface TimeseriesBarCardProps {
  title: string;
  description: string;
  caption: string;
  /** Screen-reader summary of what the chart shows. */
  chartLabel: string;
  points: TimeseriesPoint[];
  bucket: TimeBucket;
  /** Bottom series first, top series second. */
  series: [SeriesDefinition, SeriesDefinition];
  formatValue: (value: number) => string;
  formatAxisTick: (value: number) => string;
  emptyMessage: string;
}

const TONE_COLORS = {
  ink: { light: "var(--primary)", dark: "var(--primary)" },
  muted: { light: "var(--color-hairline-strong)", dark: "var(--color-muted-ink)" },
} as const;

export const TimeseriesBarCard: FC<TimeseriesBarCardProps> = ({
  title,
  description,
  caption,
  chartLabel,
  points,
  bucket,
  series,
  formatValue,
  formatAxisTick,
  emptyMessage,
}) => {
  const [view, setView] = useState<ChartView>(ChartViews.CHART);

  const config = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(series.map((item) => [item.key, { label: item.label, theme: TONE_COLORS[item.tone] }])),
    [series],
  );

  const rows = useMemo(
    () =>
      points.map((point) => ({
        id: point.bucket_start,
        label: formatBucketAxisLabel(point.bucket_start, bucket),
        title: formatBucketTitle(point.bucket_start, bucket),
        first: point[series[0].key],
        second: point[series[1].key],
      })),
    [points, bucket, series],
  );

  const isEmpty = rows.every((row) => row.first + row.second === 0);

  return (
    <SectionCard
      title={title}
      description={description}
      footer={caption}
      flush
      actions={
        <>
          <div className="flex items-center gap-4">
            {series.map((item) => (
              <LegendItem key={item.key} tone={item.tone}>
                {item.label}
              </LegendItem>
            ))}
          </div>
          <SegmentedControl
            aria-label={`${title} view`}
            value={view}
            onValueChange={setView}
            options={ChartViewFormOptions}
          />
        </>
      }
    >
      {isEmpty ? (
        <p className="px-6 py-16 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : view === ChartViews.CHART ? (
        <div className="px-4 py-5 sm:px-6">
          <ChartContainer config={config} className="aspect-auto h-64 w-full" role="img" aria-label={chartLabel}>
            <BarChart data={rows} margin={{ left: 0, right: 0, top: 8 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
              <YAxis
                width={44}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tickFormatter={formatAxisTick}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.title}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            aria-hidden="true"
                            className="size-2.5 rounded-[2px]"
                            style={{ backgroundColor: `var(--color-${name})` }}
                          />
                          {config[String(name)]?.label}
                        </span>
                        <span className="font-mono font-medium tabular-nums">{formatValue(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey={series[0].key}
                stackId="usage"
                fill={`var(--color-${series[0].key})`}
                stroke="var(--card)"
                strokeWidth={2}
                maxBarSize={28}
              />
              <Bar
                dataKey={series[1].key}
                stackId="usage"
                fill={`var(--color-${series[1].key})`}
                stroke="var(--card)"
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ChartContainer>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card">
              <TableRow>
                <TableHead className="px-6">{bucket === TimeBuckets.HOUR ? "Time" : "Date"}</TableHead>
                <TableHead className="text-right">{series[0].label}</TableHead>
                <TableHead className="text-right">{series[1].label}</TableHead>
                <TableHead className="px-6 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-6">{row.title}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatValue(row.first)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatValue(row.second)}</TableCell>
                  <TableCell className="px-6 text-right font-medium tabular-nums">
                    {formatValue(row.first + row.second)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SectionCard>
  );
};
