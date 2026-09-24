import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const CrmRecordTypes = {
  CONTACT: "CONTACT",
  LEAD: "LEAD",
  COMPANY: "COMPANY",
  DEAL: "DEAL",
  OTHER: "OTHER",
} as const;
export type CrmRecordType = (typeof CrmRecordTypes)[keyof typeof CrmRecordTypes];

export interface ContactIntegrationSummary {
  id: string;
  name: string;
  provider: string;
}

export interface Contact {
  id: string;
  company_uuid: string;
  integration_uuid: string | null;
  external_id: string | null;
  record_type: CrmRecordType;
  name: string | null;
  phone: string | null;
  email: string | null;
  external_url: string | null;
  do_not_call: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  integration: ContactIntegrationSummary | null;
}

export interface ContactRecentCall {
  id: string;
  call_number: number;
  status: string;
  outcome_label: string | null;
  started_at: string | null;
}

export interface ContactDetail extends Contact {
  recent_calls: ContactRecentCall[];
}

export interface ContactsQuery extends PaginationQuery {
  search?: string;
  integration_uuid?: string;
  record_type?: CrmRecordType | "all";
  do_not_call?: boolean;
  order_by?: "created_at" | "name" | "updated_at";
  order_direction?: "asc" | "desc";
}

export interface CreateContactDto {
  name?: string;
  phone?: string;
  email?: string;
  integration_uuid?: string;
  external_id?: string;
  record_type?: CrmRecordType;
  external_url?: string;
  do_not_call?: boolean;
  data?: Record<string, unknown>;
  default_country?: string;
}

export type UpdateContactDto = Partial<CreateContactDto>;

export interface ImportContactsDto {
  contacts: CreateContactDto[];
  default_country?: string;
}

export interface ImportRowResult {
  index: number;
  status: "created" | "updated" | "failed";
  contact_uuid?: string;
  error?: string;
}

export interface SyncContactFromCrmDto {
  integration_uuid: string;
  external_id?: string;
  phone?: string;
  email?: string;
  record_type?: CrmRecordType;
  default_country?: string;
}
