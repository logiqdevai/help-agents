import { getWeekdayLabel } from "@/config/constants/dropdowns/company/weekday.options";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";

export const CallingStatuses = {
  OPEN: "open",
  PAUSED: "paused",
} as const;
export type CallingStatus = (typeof CallingStatuses)[keyof typeof CallingStatuses];

export interface CallingWindowState {
  status: CallingStatus;
  /** Weekday and wall-clock time in the company timezone, e.g. "Tuesday 18:56". */
  localNow: string;
  /** Closing time of the current window when open, otherwise when calling next resumes. */
  detail: string;
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getLocalParts(now: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { dayOfWeek: WEEKDAY_INDEX[read("weekday")] ?? 0, time: `${read("hour")}:${read("minute")}` };
}

/** Where "now" sits inside the company's weekly calling windows (times are "HH:mm" in the company timezone). */
export function getCallingWindowState(hours: CallingHours, now: Date): CallingWindowState {
  const { dayOfWeek, time } = getLocalParts(now, hours.timezone);
  const today = hours.days.find((day) => day.day_of_week === dayOfWeek);
  const localNow = `${getWeekdayLabel(dayOfWeek)} ${time}`;

  if (today?.is_enabled && time >= today.start_time && time < today.end_time) {
    return { status: CallingStatuses.OPEN, localNow, detail: `until ${today.end_time}` };
  }

  // Next window: later today, otherwise the first enabled day after today.
  for (let offset = 0; offset < 7; offset++) {
    const candidate = hours.days.find((day) => day.day_of_week === (dayOfWeek + offset) % 7);
    if (!candidate?.is_enabled) continue;
    if (offset === 0 && time >= candidate.start_time) continue;
    const when =
      offset === 0 ? "today" : offset === 1 ? "tomorrow" : getWeekdayLabel(candidate.day_of_week);
    return { status: CallingStatuses.PAUSED, localNow, detail: `${when} at ${candidate.start_time}` };
  }

  return { status: CallingStatuses.PAUSED, localNow, detail: "" };
}
