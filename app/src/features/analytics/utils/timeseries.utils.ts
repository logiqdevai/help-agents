import { format, parse } from "date-fns";
import {
  TimeBuckets,
  type PeriodInfo,
  type TimeBucket,
} from "@/features/analytics/interfaces/analytics.interfaces";

/**
 * Bucket starts arrive as ISO strings in the company timezone ("2026-09-23T14:00:00.000+03:00").
 * The wall-clock part is what the company sees, so it is read as-is instead of being shifted
 * into the browser's timezone.
 */
function parseWallClock(iso: string): Date {
  return parse(iso.slice(0, 19), "yyyy-MM-dd'T'HH:mm:ss", new Date());
}

/** Short axis label: "14" for hours, "23 Sep" for days and weeks. */
export function formatBucketAxisLabel(bucketStart: string, bucket: TimeBucket): string {
  const date = parseWallClock(bucketStart);
  return bucket === TimeBuckets.HOUR ? format(date, "HH") : format(date, "d MMM");
}

/** Full label for tooltips and tables: "23 Sep, 14:00", "23 Sep 2026" or "Week of 22 Sep". */
export function formatBucketTitle(bucketStart: string, bucket: TimeBucket): string {
  const date = parseWallClock(bucketStart);
  if (bucket === TimeBuckets.HOUR) return format(date, "d MMM, HH:mm");
  if (bucket === TimeBuckets.WEEK) return `Week of ${format(date, "d MMM")}`;
  return format(date, "d MMM yyyy");
}

/** Sortable label for CSV rows: "2026-09-23 14:00" for hours, "2026-09-23" otherwise. */
export function formatBucketCsvLabel(bucketStart: string, bucket: TimeBucket): string {
  return bucket === TimeBuckets.HOUR ? bucketStart.slice(0, 16).replace("T", " ") : bucketStart.slice(0, 10);
}

/** "25 Aug – 23 Sep" (or a single day) for the reporting window the API resolved. */
export function formatPeriodRange(period: PeriodInfo): string {
  const from = parseWallClock(period.from);
  const to = parseWallClock(period.to);
  const fromLabel = format(from, "d MMM");
  const toLabel = format(to, "d MMM");
  return fromLabel === toLabel ? toLabel : `${fromLabel} – ${toLabel}`;
}
