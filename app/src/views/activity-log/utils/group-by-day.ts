import { format, isToday, isYesterday, parseISO } from "date-fns";
import type { ActivityLogEntry } from "@/features/activity-log/interfaces/activity-log.interfaces";

export interface ActivityDayGroup {
  /** yyyy-MM-dd */
  key: string;
  /** "Today · Tue 23 Sep", "Yesterday · Mon 22 Sep", "Fri 19 Sep" */
  label: string;
  entries: ActivityLogEntry[];
}

/** Groups newest-first entries by calendar day, keeping their order. */
export function groupActivityByDay(entries: ActivityLogEntry[]): ActivityDayGroup[] {
  const groups: ActivityDayGroup[] = [];

  for (const entry of entries) {
    const date = parseISO(entry.created_at);
    const key = format(date, "yyyy-MM-dd");
    const current = groups[groups.length - 1];
    if (current?.key === key) {
      current.entries.push(entry);
      continue;
    }
    const day = format(date, "EEE d MMM");
    const prefix = isToday(date) ? "Today · " : isYesterday(date) ? "Yesterday · " : "";
    groups.push({ key, label: `${prefix}${day}`, entries: [entry] });
  }

  return groups;
}
