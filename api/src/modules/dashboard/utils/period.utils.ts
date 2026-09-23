import { BadRequestException } from '@nestjs/common';
import { DateTime, IANAZone } from 'luxon';
import { PeriodKey, ResolvedPeriod, TimeBucket } from '../interfaces/dashboard.interface';

const MAX_RANGE_DAYS = 366;
const MAX_BUCKETS = 1000;

export function safeZone(timezone?: string | null): string {
  return timezone && IANAZone.isValidZone(timezone) ? timezone : 'UTC';
}

export function resolvePeriod(
  input: { period?: PeriodKey; from?: string; to?: string },
  timezone?: string | null,
): ResolvedPeriod {
  const zone = safeZone(timezone);
  const now = DateTime.now().setZone(zone);
  let from: DateTime;
  let to: DateTime;

  const periodKey: PeriodKey = input.period ?? 'today';

  switch (periodKey) {
    case '7d':
      from = now.minus({ days: 6 }).startOf('day');
      to = now.endOf('day');
      break;
    case '30d':
      from = now.minus({ days: 29 }).startOf('day');
      to = now.endOf('day');
      break;
    case 'custom': {
      const parsedFrom = DateTime.fromISO(input.from ?? '', { zone });
      const parsedTo = DateTime.fromISO(input.to ?? '', { zone });
      if (!parsedFrom.isValid || !parsedTo.isValid) {
        throw new BadRequestException('`from` and `to` must be valid ISO dates');
      }
      from = parsedFrom.startOf('day');
      to = parsedTo.endOf('day');
      if (to < from) throw new BadRequestException('`to` must not be before `from`');
      if (to.diff(from, 'days').days > MAX_RANGE_DAYS) {
        throw new BadRequestException(`Date range cannot exceed ${MAX_RANGE_DAYS} days`);
      }
      break;
    }
    case 'today':
    default:
      from = now.startOf('day');
      to = now.endOf('day');
  }

  return {
    period: periodKey,
    timezone: zone,
    from: from.toJSDate(),
    to: to.toJSDate(),
    from_iso: from.toISO(),
    to_iso: to.toISO(),
  };
}

export function defaultBucket(period: ResolvedPeriod): TimeBucket {
  const days = DateTime.fromJSDate(period.to).diff(DateTime.fromJSDate(period.from), 'days').days;
  return days <= 1 ? 'hour' : 'day';
}

const BUCKET_KEY_FORMAT = "yyyy-LL-dd'T'HH:mm:ss";

export function bucketKey(dt: DateTime): string {
  return dt.toFormat(BUCKET_KEY_FORMAT);
}

/** Every bucket start (local time in the period's zone) covering the period. */
export function enumerateBuckets(period: ResolvedPeriod, bucket: TimeBucket): DateTime[] {
  const unit = bucket === 'week' ? 'week' : bucket;
  const end = DateTime.fromJSDate(period.to).setZone(period.timezone);
  let cursor = DateTime.fromJSDate(period.from).setZone(period.timezone).startOf(unit);
  const seen = new Set<string>();
  const buckets: DateTime[] = [];

  while (cursor <= end) {
    const key = bucketKey(cursor);
    if (!seen.has(key)) {
      seen.add(key);
      buckets.push(cursor);
    }
    if (buckets.length > MAX_BUCKETS) {
      throw new BadRequestException('Too many time buckets for this range; use a larger bucket');
    }
    cursor = cursor.plus({ [unit]: 1 });
  }
  return buckets;
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'object' && 'toNumber' in (value as any) ? (value as any).toNumber() : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}
