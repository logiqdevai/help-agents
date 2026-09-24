import { PhoneNumberSource, PhoneNumberStatus } from 'generated/prisma';

export interface PhoneNumberAgentRef {
  id: string;
  name: string;
}

export interface PhoneNumberSetup {
  /** Where the business's carrier must send inbound calls for this number. */
  inbound_sip_address: string | null;
  /** The carrier trunk address the platform dials out through. */
  termination_uri: string | null;
}

export interface PhoneNumberResponse {
  id: string;
  number: string;
  label: string | null;
  source: PhoneNumberSource;
  status: PhoneNumberStatus;
  last_error: string | null;
  agent: PhoneNumberAgentRef | null;
  call_count: number;
  setup?: PhoneNumberSetup;
  created_at: Date;
  updated_at: Date;
}
