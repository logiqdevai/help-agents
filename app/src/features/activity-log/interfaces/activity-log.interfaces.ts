import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const ActorTypes = {
  USER: "USER",
  SYSTEM: "SYSTEM",
  AGENT: "AGENT",
  PROVIDER: "PROVIDER",
} as const;
export type ActorType = (typeof ActorTypes)[keyof typeof ActorTypes];

/** `entity_type` values the API writes to the activity log. */
export const ActivityEntityTypes = {
  AGENT: "agent",
  ALERT: "alert",
  AUTOMATION_RULE: "automation_rule",
  CALL: "call",
  CALL_ACTION: "call_action",
  COMPANY: "company",
  COMPANY_INVITATION: "company_invitation",
  COMPANY_MEMBER: "company_member",
  CONTACT: "contact",
  CRM_TOOL: "crm_tool",
  INTEGRATION: "integration",
  KNOWLEDGE_SOURCE: "knowledge_source",
  PHONE_NUMBER: "phone_number",
  SCHEDULED_CALL: "scheduled_call",
} as const;
export type ActivityEntityType = (typeof ActivityEntityTypes)[keyof typeof ActivityEntityTypes];

export interface ActivityActor {
  id: string;
  name: string | null;
  email: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: ActivityActor | null;
  actor_type: ActorType;
  action: string;
  entity_type: string | null;
  entity_uuid: string | null;
  entity_label: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ActivityLogQuery extends PaginationQuery {
  search?: string;
  user_uuid?: string;
  actor_type?: ActorType;
  /** One or more entity types, comma separated. */
  entity_type?: string;
  /** ISO timestamps. */
  from?: string;
  to?: string;
}

export interface ActivityActorOption {
  id: string;
  name: string;
}
