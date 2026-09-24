import { OutcomeCount } from '../interfaces/dashboard.interface';

interface OutcomeGroupRow {
  outcome_key: string | null;
  outcome_label: string | null;
  is_successful: boolean | null;
  _count: { _all: number };
}

/**
 * Collapses call groups (outcome + success snapshot) into one row per outcome key,
 * most frequent first. An outcome counts as successful when any of its calls was.
 */
export function toOutcomeCounts(rows: OutcomeGroupRow[]): OutcomeCount[] {
  const byKey = new Map<string, OutcomeCount>();

  for (const row of rows) {
    const mapKey = row.outcome_key ?? '';
    const existing = byKey.get(mapKey);
    if (existing) {
      existing.count += row._count._all;
      existing.is_successful = existing.is_successful || row.is_successful === true;
    } else {
      byKey.set(mapKey, {
        key: row.outcome_key,
        label: row.outcome_label,
        is_successful: row.is_successful === true,
        count: row._count._all,
      });
    }
  }

  return [...byKey.values()].sort((a, b) => b.count - a.count);
}
