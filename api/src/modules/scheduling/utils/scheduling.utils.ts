import { BadRequestException } from '@nestjs/common';
import { DateTime, IANAZone } from 'luxon';

export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export type ScheduleMode = 'immediately' | 'after_minutes' | 'tomorrow' | 'date';

export interface WhenInput {
  mode: ScheduleMode;
  minutes?: number;
  date?: string;
  time?: string;
}

export interface HoursRow {
  day_of_week: number;
  start_time: string;
  is_enabled: boolean;
}

export function safeZone(zone?: string | null): string {
  return zone && IANAZone.isValidZone(zone) ? zone : 'UTC';
}

function applyWindowStart(day: DateTime, hours: HoursRow[]): DateTime {
  const row = hours.find((h) => h.day_of_week === day.weekday % 7);
  if (!row?.is_enabled || !TIME_RE.test(row.start_time)) return day;
  const [h, m] = row.start_time.split(':').map(Number);
  return day.set({ hour: h, minute: m });
}

/** Turns the requested schedule into an instant; the caller still adjusts it to calling hours. */
export function resolveRequestedTime(
  when: WhenInput,
  timezone: string,
  hours: HoursRow[],
  now: DateTime = DateTime.now(),
): Date {
  const zone = safeZone(timezone);

  switch (when.mode) {
    case 'immediately':
      return now.toJSDate();

    case 'after_minutes': {
      if (!when.minutes || when.minutes < 1) {
        throw new BadRequestException('`minutes` is required for mode "after_minutes"');
      }
      return now.plus({ minutes: when.minutes }).toJSDate();
    }

    case 'tomorrow': {
      const day = now.setZone(zone).plus({ days: 1 }).startOf('day');
      return applyWindowStart(day, hours).toJSDate();
    }

    case 'date': {
      if (!when.date) throw new BadRequestException('`date` is required for mode "date"');
      const parsed = DateTime.fromISO(when.date, { zone });
      if (!parsed.isValid) throw new BadRequestException('Invalid `date`');

      let target = parsed;
      if (!when.date.includes('T')) {
        if (when.time) {
          if (!TIME_RE.test(when.time)) throw new BadRequestException('`time` must be HH:mm');
          const [h, m] = when.time.split(':').map(Number);
          target = parsed.set({ hour: h, minute: m });
        } else {
          target = applyWindowStart(parsed.startOf('day'), hours);
        }
      }

      if (target.toMillis() <= now.toMillis()) {
        throw new BadRequestException('The requested date must be in the future');
      }
      return target.toJSDate();
    }

    default:
      throw new BadRequestException('Invalid schedule mode');
  }
}

/** delays[attempt-1], repeating the last delay when the list is shorter than the attempts. */
export function delayForAttempt(delays: number[], attempt: number): number {
  if (!delays.length) return 120;
  return delays[Math.min(Math.max(attempt - 1, 0), delays.length - 1)];
}
