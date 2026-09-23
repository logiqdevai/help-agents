import { AlertType, CallStatus, OutcomeSystemType } from 'generated/prisma';
import { MappedCallEnd, TranscriptSegment, VoiceCallPayload } from '../interfaces/calls.interface';

const FAILURE_MESSAGES: Record<string, string> = {
  dial_failed: 'The call could not be connected',
  invalid_destination: 'The phone number is invalid',
  telephony_provider_permission_denied: 'The phone number is not permitted to place this call',
  telephony_provider_unavailable: 'The phone network was temporarily unavailable',
  sip_routing_error: 'The call could not be routed',
  concurrency_limit_reached: 'Too many calls were running at the same time',
  no_concurrency_fallback: 'Too many calls were running at the same time',
  no_valid_payment: 'The voice service is unavailable for this account',
  registered_call_timeout: 'The call was never connected',
  marked_as_spam: 'The call was flagged as spam by the carrier',
  scam_detected: 'The call was flagged as spam by the carrier',
};

const FAILED_REASONS = new Set(Object.keys(FAILURE_MESSAGES));

/** Maps the provider disconnection reason / call status onto platform call status. */
export function mapCallEnd(payload: VoiceCallPayload): MappedCallEnd {
  const reason = payload.disconnection_reason ?? '';

  switch (reason) {
    case 'voicemail_reached':
      return { status: CallStatus.COMPLETED, in_voicemail: true, system_outcome: OutcomeSystemType.VOICEMAIL };
    case 'dial_no_answer':
    case 'user_declined':
      return { status: CallStatus.NO_ANSWER, system_outcome: OutcomeSystemType.NO_ANSWER };
    case 'dial_busy':
      return { status: CallStatus.BUSY, system_outcome: OutcomeSystemType.NO_ANSWER };
    case 'call_transfer':
    case 'transfer_bridged':
      return { status: CallStatus.TRANSFERRED };
    case 'manual_stopped':
      return payload.start_timestamp
        ? { status: CallStatus.COMPLETED }
        : { status: CallStatus.CANCELED };
  }

  if (reason === 'invalid_destination') {
    return {
      status: CallStatus.FAILED,
      error_code: reason,
      error_message: FAILURE_MESSAGES[reason],
      alert_type: AlertType.INVALID_PHONE_NUMBER,
    };
  }

  if (FAILED_REASONS.has(reason) || reason.startsWith('error_')) {
    return {
      status: CallStatus.FAILED,
      error_code: reason,
      error_message: FAILURE_MESSAGES[reason] ?? 'The call ended because of a technical error',
      alert_type: AlertType.CALL_FAILED,
    };
  }

  if (payload.call_status === 'error') {
    return {
      status: CallStatus.FAILED,
      error_code: reason || 'error',
      error_message: 'The call ended because of a technical error',
      alert_type: AlertType.CALL_FAILED,
    };
  }

  if (payload.call_status === 'not_connected') {
    return { status: CallStatus.NO_ANSWER, system_outcome: OutcomeSystemType.NO_ANSWER };
  }

  return { status: CallStatus.COMPLETED };
}

export function normalizeTranscript(items: VoiceCallPayload['transcript_object']): TranscriptSegment[] {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && typeof item.content === 'string')
    .map((item) => {
      const words = Array.isArray(item.words) ? item.words : [];
      const segment: TranscriptSegment = {
        role: item.role === 'agent' ? 'agent' : 'customer',
        text: item.content as string,
      };
      const first = words[0]?.start;
      const last = words.length ? words[words.length - 1]?.end : undefined;
      if (typeof first === 'number') segment.start = first;
      if (typeof last === 'number') segment.end = last;
      return segment;
    });
}

export function transcriptToText(segments: TranscriptSegment[]): string {
  return segments.map((s) => `${s.role === 'agent' ? 'Agent' : 'Customer'}: ${s.text}`).join('\n');
}

export function msToDate(ms?: number | null): Date | null {
  return typeof ms === 'number' && Number.isFinite(ms) ? new Date(ms) : null;
}

export function callDurationSeconds(payload: VoiceCallPayload): number | null {
  if (typeof payload.duration_ms === 'number') return Math.max(0, Math.round(payload.duration_ms / 1000));
  if (payload.start_timestamp && payload.end_timestamp) {
    return Math.max(0, Math.round((payload.end_timestamp - payload.start_timestamp) / 1000));
  }
  return null;
}

const PROVIDER_KEY_RE = /provider|external|retell/i;

/** Removes provider-specific keys / names from data shown to customers. */
export function stripProviderInfo<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => stripProviderInfo(v)) as unknown as T;
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value as Record<string, any>)) {
      if (PROVIDER_KEY_RE.test(key)) continue;
      out[key] = stripProviderInfo(val);
    }
    return out as T;
  }
  if (typeof value === 'string') return value.replace(/retell/gi, 'voice service') as unknown as T;
  return value;
}

export function humanizeKey(key: string): string {
  const text = key.replace(/^goal[._]/, '').replace(/[_.-]+/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : key;
}

export function decimalToNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value.toString());
}

export function splitStoragePath(path: string): { folder: string; filename: string } {
  const idx = path.lastIndexOf('/');
  return idx === -1 ? { folder: '', filename: path } : { folder: path.slice(0, idx), filename: path.slice(idx + 1) };
}
