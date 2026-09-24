import { WeekdayFormOptions } from "@/config/constants/dropdowns/company/weekday.options";
import {
  RetryHoursModes,
  type RetryCallingHoursOverride,
  type RetryRule,
  type UpsertRetryRuleDto,
} from "@/features/agents/interfaces/agents.interfaces";
import type { RetryRuleFormData } from "@/features/agents/validation-schemas/agents.schema";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";

const DEFAULT_DELAY_MINUTES = "120";
const DEFAULT_START = "09:00";
const DEFAULT_END = "18:00";
const WEEKEND_DAYS = [0, 6];

type DayRow = RetryRuleFormData["days"][number];

/** The seven day rows of the custom hours editor, seeded from the agent's own hours, then the company's. */
function toDayRows(override: RetryCallingHoursOverride | null, companyHours: CallingHours | undefined): DayRow[] {
  const source = override?.days ?? companyHours?.days ?? [];
  return WeekdayFormOptions.map(({ id }) => {
    const day = source.find((candidate) => candidate.day_of_week === id);
    return {
      day_of_week: id,
      is_enabled: day ? day.is_enabled : !WEEKEND_DAYS.includes(id),
      start_time: day?.start_time ?? DEFAULT_START,
      end_time: day?.end_time ?? DEFAULT_END,
    };
  });
}

/** One delay per gap between attempts; the API repeats the last stored delay, so it is expanded here. */
export function resizeDelays(delays: string[], attempts: number): string[] {
  const gaps = Math.max(attempts - 1, 0);
  const fallback = delays.at(-1) ?? DEFAULT_DELAY_MINUTES;
  return Array.from({ length: gaps }, (_, index) => delays[index] ?? fallback);
}

export function toRetryRuleFormValues(rule: RetryRule, companyHours?: CallingHours): RetryRuleFormData {
  const override = rule.calling_hours_override as RetryCallingHoursOverride | null;
  return {
    is_enabled: rule.is_enabled,
    max_attempts: String(rule.max_attempts),
    retry_on: rule.retry_on,
    delays_minutes: resizeDelays(rule.delays_minutes.map(String), rule.max_attempts),
    hours_mode: override ? RetryHoursModes.CUSTOM : RetryHoursModes.COMPANY,
    days: toDayRows(override, companyHours),
  };
}

export function toRetryRuleDto(values: RetryRuleFormData, timezone?: string): UpsertRetryRuleDto {
  return {
    is_enabled: values.is_enabled,
    max_attempts: Number(values.max_attempts),
    delays_minutes: values.delays_minutes.map(Number),
    retry_on: values.retry_on,
    calling_hours_override: values.hours_mode === RetryHoursModes.CUSTOM ? { ...(timezone ? { timezone } : {}), days: values.days } : null,
  };
}
