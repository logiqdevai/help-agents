import { format, formatDistanceToNowStrict, isToday, isTomorrow, isValid, parseISO } from "date-fns";
import { CallDirections, type CallListItem } from "@/features/calls/interfaces/calls.interfaces";

const parse = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
};

/** "14:31" for calls made today, "23 Sep, 14:31" for older ones. */
export function formatCallStart(call: Pick<CallListItem, "started_at" | "created_at">): string {
  const value = call.started_at ?? call.created_at;
  const date = parse(value);
  if (!date) return "—";
  return isToday(date) ? format(date, "HH:mm") : format(date, "d MMM, HH:mm");
}

/** "14:31:06" — timeline entries need seconds to be readable. */
export function formatTimeWithSeconds(value: string | null | undefined): string {
  const date = parse(value);
  return date ? format(date, "HH:mm:ss") : "—";
}

/** "Tuesday 23 September, 14:31" — used in the call detail subtitle. */
export function formatLongDateTime(value: string | null | undefined): string {
  const date = parse(value);
  return date ? format(date, "EEEE d MMMM, HH:mm") : "—";
}

/** The customer's number: who was dialed on outbound calls, who called in on inbound ones. */
export function getCustomerNumber(call: Pick<CallListItem, "direction" | "to_number" | "from_number">): string | null {
  return call.direction === CallDirections.INBOUND ? call.from_number : call.to_number;
}

/** Renders a value the agent gathered (yes/no, list, number, text) as plain text. */
export function formatGatheredValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(formatGatheredValue).join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** "Today 17:45" / "Tomorrow 10:00" / "Wed 24 Sep, 09:00", plus how far away it is. */
export function formatScheduledFor(value: string): { primary: string; secondary: string } {
  const date = parse(value);
  if (!date) return { primary: "—", secondary: "" };
  const time = format(date, "HH:mm");
  const primary = isToday(date)
    ? `Today ${time}`
    : isTomorrow(date)
      ? `Tomorrow ${time}`
      : format(date, "EEE d MMM, HH:mm");
  return { primary, secondary: formatDistanceToNowStrict(date, { addSuffix: true }) };
}
