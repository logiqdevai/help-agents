import { CallStatus, OutcomeSystemType, AlertType } from 'generated/prisma';

/** Loosely typed provider call object as delivered in webhooks (only fields we read). */
export interface VoiceCallPayload {
  call_id: string;
  call_status?: string;
  direction?: 'inbound' | 'outbound';
  from_number?: string;
  to_number?: string;
  agent_id?: string;
  agent_version?: number;
  metadata?: Record<string, any> | null;
  start_timestamp?: number;
  end_timestamp?: number;
  duration_ms?: number;
  disconnection_reason?: string;
  transcript?: string;
  transcript_object?: Array<{
    role?: string;
    content?: string;
    words?: Array<{ word?: string; start?: number; end?: number }>;
  }>;
  recording_url?: string;
  scrubbed_recording_url?: string;
  call_cost?: Record<string, any>;
  call_analysis?: {
    call_summary?: string;
    call_successful?: boolean;
    in_voicemail?: boolean;
    custom_analysis_data?: Record<string, any> | null;
  };
  transfer_destination?: string | null;
  collected_dynamic_variables?: Record<string, string>;
}

export interface VoiceWebhookEvent {
  event: string;
  call?: VoiceCallPayload;
  [key: string]: any;
}

export interface MappedCallEnd {
  status: CallStatus;
  in_voicemail?: boolean;
  error_code?: string;
  error_message?: string;
  alert_type?: AlertType;
  system_outcome?: OutcomeSystemType;
}

export interface TranscriptSegment {
  role: 'agent' | 'customer';
  text: string;
  start?: number;
  end?: number;
}
