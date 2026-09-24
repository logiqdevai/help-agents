import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const PhoneNumberSources = {
  PROVISIONED: "PROVISIONED",
  BYO: "BYO",
} as const;
export type PhoneNumberSource = (typeof PhoneNumberSources)[keyof typeof PhoneNumberSources];

export const PhoneNumberStatuses = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  ERROR: "ERROR",
  RELEASED: "RELEASED",
} as const;
export type PhoneNumberStatus = (typeof PhoneNumberStatuses)[keyof typeof PhoneNumberStatuses];

/** Tabs on the phone numbers page: "attention" groups numbers that are pending or in error. */
export const PhoneNumberTabs = {
  ALL: "all",
  ACTIVE: "active",
  ATTENTION: "attention",
} as const;
export type PhoneNumberTab = (typeof PhoneNumberTabs)[keyof typeof PhoneNumberTabs];

export interface PhoneNumberAgentRef {
  id: string;
  name: string;
}

/** Where the carrier of a number the business brought itself has to send calls. */
export interface PhoneNumberSetup {
  inbound_sip_address: string | null;
  termination_uri: string | null;
}

export interface PhoneNumber {
  id: string;
  number: string;
  label: string | null;
  source: PhoneNumberSource;
  status: PhoneNumberStatus;
  last_error: string | null;
  agent: PhoneNumberAgentRef | null;
  call_count: number;
  /** Present for numbers the business brought itself. */
  setup?: PhoneNumberSetup;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumbersQuery extends PaginationQuery {
  status?: PhoneNumberStatus | "all";
  source?: PhoneNumberSource | "all";
  agent_uuid?: string | "all";
  search?: string;
  order_by?: "created_at" | "number";
  order_direction?: "asc" | "desc";
}

export interface ProvisionPhoneNumberDto {
  country_code?: string;
  area_code?: string;
  label?: string;
}

export interface ImportPhoneNumberDto {
  number: string;
  default_country?: string;
  termination_uri: string;
  sip_username?: string;
  sip_password?: string;
  label?: string;
}

export interface UpdatePhoneNumberDto {
  label?: string;
}

export interface ProvisionPhoneNumberInput {
  dto: ProvisionPhoneNumberDto;
  /** Optionally hand the new number straight to an agent. */
  agent_uuid?: string;
}

export interface ProvisionPhoneNumberResult {
  phone: PhoneNumber;
  /** Set when the number was added but assigning it to the agent failed. */
  agentError: string | null;
}

export interface AgentOption {
  id: string;
  name: string;
}
