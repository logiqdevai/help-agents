/**
 * Provider-neutral voice API (spec §31, principle 3). Nothing outside
 * `modules/voice-provider` and `integrations/retell` may import Retell types;
 * everything else talks to `VoiceProviderService` with these shapes.
 */

export interface VoiceOption {
  voice_id: string;
  name: string;
  gender?: string | null;
  accent?: string | null;
  language?: string | null;
  preview_audio_url?: string | null;
}

export interface CreateOutboundCallInput {
  call_uuid: string;
  agent_uuid: string;
  from_number: string;
  to_number: string;
  /** Personalization values injected into the agent prompt before dialing. */
  dynamic_variables?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface CreateOutboundCallResult {
  external_call_id: string;
  /** Provider agent version the call ran on. */
  agent_version?: number | null;
}

export interface ProvisionPhoneNumberInput {
  company_uuid: string;
  country_code?: string;
  area_code?: string;
  label?: string;
}

export interface ImportPhoneNumberInput {
  company_uuid: string;
  /** E.164 number the business already owns. */
  number: string;
  /** SIP trunk termination URI of the business's carrier. */
  termination_uri: string;
  sip_username?: string;
  sip_password?: string;
  label?: string;
}

export interface ProviderPhoneNumber {
  /** E.164 */
  number: string;
  external_id: string;
  provider_number_type: string;
  byo_config?: Record<string, any> | null;
}

export interface SyncKnowledgeVersionResult {
  external_knowledge_base_id: string;
  external_source_id?: string | null;
}

/** Raw provider call as returned by `getCall` (used for reconciliation only). */
export type ProviderCallPayload = Record<string, any>;
