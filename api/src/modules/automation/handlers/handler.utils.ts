import { CallAction, Prisma } from 'generated/prisma';

export function payloadOf(action: CallAction): Record<string, any> {
  const payload = action.request_payload;
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? (payload as Record<string, any>)
    : {};
}

/** Short human-readable message from axios / generic errors (no credentials, no full bodies). */
export function describeError(error: any): string {
  const data = error?.response?.data;
  const upstream =
    (typeof data?.error === 'string' ? data.error : data?.error?.message) ?? data?.message;
  const status = error?.response?.status;
  const base = typeof upstream === 'string' ? upstream : (error?.message ?? 'Unknown error');
  return (status ? `HTTP ${status}: ${base}` : base).slice(0, 300);
}

export const asJson = (value: Record<string, unknown>): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
