import { WeekdayFormOptions } from "@/config/constants/dropdowns/company/weekday.options";
import type { CallingHours, CallingHoursDay } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

const windowOf = (day: CallingHoursDay) => (day.is_enabled ? `${day.start_time}–${day.end_time}` : "no calling");

/**
 * "Monday–Saturday 09:00–18:00", "Sunday no calling": consecutive days (Monday first) that share
 * the same window are collapsed into one range.
 */
export function summarizeCallingHours(hours: CallingHours): string[] {
  const dayByNumber = new Map(hours.days.map((day) => [day.day_of_week, day]));
  const groups: { first: string; last: string; window: string }[] = [];

  for (const { id, label } of WeekdayFormOptions) {
    const day = dayByNumber.get(id);
    if (!day) continue;
    const window = windowOf(day);
    const current = groups[groups.length - 1];
    if (current && current.window === window) current.last = label;
    else groups.push({ first: label, last: label, window });
  }

  return groups.map(({ first, last, window }) => `${first === last ? first : `${first}–${last}`} ${window}`);
}
