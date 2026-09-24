import {
  ScheduleModes,
  type ScheduleWhenDto,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import type { RescheduleCallFormData } from "@/features/scheduled-calls/validation-schemas/scheduled-calls.schema";

/** Turns the "when" part of a schedule form into the API payload (only the fields the mode needs). */
export function toScheduleWhen(values: RescheduleCallFormData): ScheduleWhenDto {
  switch (values.mode) {
    case ScheduleModes.AFTER_MINUTES:
      return { mode: values.mode, minutes: Number(values.minutes) };
    case ScheduleModes.DATE:
      return { mode: values.mode, date: values.date };
    default:
      return { mode: values.mode };
  }
}
