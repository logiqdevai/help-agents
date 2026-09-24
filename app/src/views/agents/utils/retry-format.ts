const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? "" : "s"}`;

/** 30 -> "30 minutes"; 120 -> "2 hours"; 1440 -> "1 day". Odd values fall back to minutes. */
export function formatDelayMinutes(minutes: number): string {
  if (minutes % MINUTES_PER_DAY === 0) return plural(minutes / MINUTES_PER_DAY, "day");
  if (minutes % MINUTES_PER_HOUR === 0) return plural(minutes / MINUTES_PER_HOUR, "hour");
  return plural(minutes, "minute");
}

/** [120, 1440] -> "2 hours, then 1 day"; the last delay repeats for any further attempt. */
export function formatDelays(delays: number[]): string {
  return delays.map(formatDelayMinutes).join(", then ");
}
