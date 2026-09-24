"use client";

import { useCallback } from "react";
import { TimeBuckets, type UsageTimeseries } from "@/features/analytics/interfaces/analytics.interfaces";
import { formatBucketCsvLabel } from "@/features/analytics/utils/timeseries.utils";
import { downloadCsv } from "@/lib/download-csv";

/** Returns a handler that saves the loaded usage-over-time series as a CSV file. */
export function useExportUsageCsv(timeseries: UsageTimeseries | undefined) {
  return useCallback(() => {
    if (!timeseries) return;
    const { period, bucket, points } = timeseries;
    const header = [
      bucket === TimeBuckets.HOUR ? "Time" : "Date",
      "Calls",
      "Successful calls",
      "Unsuccessful calls",
      "Minutes",
      "AI cost",
      "Telephony cost",
      "Total cost",
    ];
    const rows = points.map((point) => [
      formatBucketCsvLabel(point.bucket_start, bucket),
      point.calls,
      point.successful_calls,
      point.unsuccessful_calls,
      point.minutes,
      point.ai_cost,
      point.telephony_cost,
      point.cost,
    ]);
    downloadCsv(`usage-${period.from.slice(0, 10)}_${period.to.slice(0, 10)}.csv`, [header, ...rows]);
  }, [timeseries]);
}
