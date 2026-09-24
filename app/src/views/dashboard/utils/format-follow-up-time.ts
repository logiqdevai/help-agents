import { format, isToday, isTomorrow, parseISO } from "date-fns";

/** "Today 17:45", "Tomorrow 10:00", otherwise "27 Sep, 09:30". */
export function formatFollowUpTime(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return `Today ${format(date, "HH:mm")}`;
  if (isTomorrow(date)) return `Tomorrow ${format(date, "HH:mm")}`;
  return format(date, "d MMM, HH:mm");
}
