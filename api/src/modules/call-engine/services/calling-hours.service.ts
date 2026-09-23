import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { CallingHoursOverride } from '../interfaces/call-engine.interface';

interface DayWindow {
  start: number;
  end: number;
  enabled: boolean;
}

interface ResolvedHours {
  timezone: string;
  days: Map<number, DayWindow>;
}

const DEFAULT_START = '09:00';
const DEFAULT_END = '18:00';
const SCAN_DAYS = 14;

function toMinutes(value: string): number {
  const [h, m] = (value || '').split(':').map((v) => parseInt(v, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

/** Company calling hours (spec §27), evaluated in the company timezone. */
@Injectable()
export class CallingHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async isCallAllowed(
    companyUuid: string,
    at: Date = new Date(),
    override?: CallingHoursOverride | null,
  ): Promise<boolean> {
    const hours = await this.resolve(companyUuid, override);
    const dt = DateTime.fromJSDate(at, { zone: hours.timezone });
    const window = hours.days.get(dt.weekday % 7);
    if (!window?.enabled) return false;
    const minutes = dt.hour * 60 + dt.minute;
    return minutes >= window.start && minutes < window.end;
  }

  async nextAllowedTime(
    companyUuid: string,
    from: Date,
    override?: CallingHoursOverride | null,
  ): Promise<Date> {
    const hours = await this.resolve(companyUuid, override);
    const dt = DateTime.fromJSDate(from, { zone: hours.timezone });

    for (let offset = 0; offset <= SCAN_DAYS; offset++) {
      const day = dt.startOf('day').plus({ days: offset });
      const window = hours.days.get(day.weekday % 7);
      if (!window?.enabled || window.end <= window.start) continue;

      const start = day.plus({ minutes: window.start });
      const end = day.plus({ minutes: window.end });

      if (offset === 0) {
        if (dt >= start && dt < end) return from;
        if (dt < start) return start.toJSDate();
        continue;
      }
      return start.toJSDate();
    }

    return dt.plus({ days: SCAN_DAYS }).toJSDate();
  }

  private async resolve(
    companyUuid: string,
    override?: CallingHoursOverride | null,
  ): Promise<ResolvedHours> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyUuid },
      select: { timezone: true },
    });
    const timezone = this.validZone(override?.timezone) ?? this.validZone(company?.timezone) ?? 'UTC';

    let rows: Array<{ day_of_week: number; start_time: string; end_time: string; is_enabled: boolean }>;
    if (override?.days?.length) {
      rows = override.days;
    } else {
      rows = await this.prisma.companyCallingHour.findMany({ where: { company_uuid: companyUuid } });
    }

    const days = new Map<number, DayWindow>();
    if (rows.length === 0) {
      for (let d = 0; d < 7; d++) {
        days.set(d, {
          start: toMinutes(DEFAULT_START),
          end: toMinutes(DEFAULT_END),
          enabled: d >= 1 && d <= 5,
        });
      }
    } else {
      // Days without a row are treated as "No calling".
      for (let d = 0; d < 7; d++) days.set(d, { start: 0, end: 0, enabled: false });
      for (const row of rows) {
        days.set(row.day_of_week, {
          start: toMinutes(row.start_time),
          end: toMinutes(row.end_time),
          enabled: row.is_enabled,
        });
      }
    }

    return { timezone, days };
  }

  private validZone(zone?: string | null): string | null {
    if (!zone) return null;
    return DateTime.local().setZone(zone).isValid ? zone : null;
  }
}
