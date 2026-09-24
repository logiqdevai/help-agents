import type {
  IntegrationProvider,
  IntegrationStatus,
} from "@/features/integrations/interfaces/integrations.interfaces";
import type { KnowledgeSourceType, KnowledgeStatus } from "@/features/knowledge/interfaces/knowledge.interfaces";
import type { OutcomeCount } from "@/features/analytics/interfaces/analytics.interfaces";
import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const AgentStatuses = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type AgentStatus = (typeof AgentStatuses)[keyof typeof AgentStatuses];

export const GoalRequirements = {
  REQUIRED: "REQUIRED",
  OPTIONAL: "OPTIONAL",
} as const;
export type GoalRequirement = (typeof GoalRequirements)[keyof typeof GoalRequirements];

export const GoalDataTypes = {
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  NUMBER: "NUMBER",
  DATE: "DATE",
  ENUM: "ENUM",
} as const;
export type GoalDataType = (typeof GoalDataTypes)[keyof typeof GoalDataTypes];

/** Outcomes the platform detects on its own; every agent keeps all four. */
export const OutcomeSystemTypes = {
  VOICEMAIL: "VOICEMAIL",
  NO_ANSWER: "NO_ANSWER",
  WRONG_NUMBER: "WRONG_NUMBER",
  UNKNOWN: "UNKNOWN",
} as const;
export type OutcomeSystemType = (typeof OutcomeSystemTypes)[keyof typeof OutcomeSystemTypes];

/** The steps of setting up an agent; the keys match `AgentReadiness.steps`. */
export const AgentSetupSteps = {
  BASICS: "basics",
  BEHAVIOR: "behavior",
  KNOWLEDGE: "knowledge",
  CRM: "crm",
  PHONE: "phone",
  TEST: "test",
  ACTIVATE: "activate",
} as const;
export type AgentSetupStep = (typeof AgentSetupSteps)[keyof typeof AgentSetupSteps];

export const RetryTriggers = {
  NO_ANSWER: "NO_ANSWER",
  BUSY: "BUSY",
  FAILED: "FAILED",
  VOICEMAIL: "VOICEMAIL",
} as const;
export type RetryTrigger = (typeof RetryTriggers)[keyof typeof RetryTriggers];

/** Whether an agent's retries follow the company calling hours or hours of their own. */
export const RetryHoursModes = {
  COMPANY: "company",
  CUSTOM: "custom",
} as const;
export type RetryHoursMode = (typeof RetryHoursModes)[keyof typeof RetryHoursModes];

export interface AgentCrmRef {
  id: string;
  name: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
}

export interface AgentPhoneRef {
  id: string;
  number: string;
}

export interface AgentListItem {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  status: AgentStatus;
  language: string;
  /** Voice id as listed by `GET /voices`. */
  voice: string | null;
  crm_integration: AgentCrmRef | null;
  phone_numbers: AgentPhoneRef[];
  knowledge_sources_count: number;
  calls_made: number;
  /** Percent of finished calls that were successful. */
  success_rate: number | null;
  last_call_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentsQuery extends PaginationQuery {
  status?: AgentStatus | "all";
  search?: string;
  crm_integration_uuid?: string;
  order_by?: "created_at" | "updated_at" | "name";
  order_direction?: "asc" | "desc";
}

export interface AgentGoalItem {
  id: string;
  key: string;
  label: string;
  description: string | null;
  requirement: GoalRequirement;
  data_type: GoalDataType;
  enum_values: string[];
  position: number;
}

export interface AgentQuestion {
  id: string;
  question: string;
  is_required: boolean;
  expected_answer: string | null;
  position: number;
}

export interface AgentOutcome {
  id: string;
  key: string;
  label: string;
  description: string | null;
  is_success: boolean;
  system_type: OutcomeSystemType | null;
  position: number;
  triggers_transfer: boolean;
}

export interface AgentCrmToolRef {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string | null;
}

export interface AgentKnowledgeRef {
  id: string;
  name: string;
  type: KnowledgeSourceType;
  status: KnowledgeStatus;
  is_enabled: boolean;
}

/** The full configuration of an agent (`GET /agents/:id`). */
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  status: AgentStatus;
  voice: string | null;
  language: string;
  first_message: string | null;
  instructions: string;
  goal: string | null;
  success_criteria: string | null;
  failure_criteria: string | null;
  max_call_duration_seconds: number | null;
  crm_integration_uuid: string | null;
  crm_integration: AgentCrmRef | null;
  detect_voicemail: boolean;
  leave_voicemail: boolean;
  voicemail_message: string | null;
  transfer_enabled: boolean;
  transfer_on_request: boolean;
  transfer_on_unresolved: boolean;
  transfer_number: string | null;
  transfer_fallback_message: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  goal_items: AgentGoalItem[];
  questions: AgentQuestion[];
  outcomes: AgentOutcome[];
  crm_tools: AgentCrmToolRef[];
  knowledge_sources: AgentKnowledgeRef[];
  access_grants_count: number;
}

export interface ReadinessBlocker {
  code: string;
  message: string;
}

export interface ReadinessStep {
  complete: boolean;
  optional?: boolean;
}

export interface AgentReadiness {
  is_ready: boolean;
  blockers: ReadinessBlocker[];
  warnings: string[];
  steps: Record<AgentSetupStep, ReadinessStep>;
}

export interface AgentPeriodStats {
  total_calls: number;
  successful_calls: number;
  success_rate: number | null;
}

export interface AgentOverview {
  id: string;
  name: string;
  status: AgentStatus;
  goal: string | null;
  knowledge_sources_count: number;
  crm_integration: AgentCrmRef | null;
  phone_numbers: AgentPhoneRef[];
  voice: string | null;
  language: string;
  calls_made: number;
  success_rate: number | null;
  average_duration_seconds: number | null;
  average_cost: number | null;
  currency: string;
  last_call_at: string | null;
  activated_at: string | null;
  calls_today: number;
  calls_yesterday: number;
  last_30_days: AgentPeriodStats;
  outcomes_30_days: OutcomeCount[];
  readiness: AgentReadiness;
  unresolved_alerts: number;
}

/** A tool of the agent's CRM, flagged when this agent may use it. */
export interface AgentCrmToolOption extends AgentCrmToolRef {
  allowed: boolean;
}

export interface AgentCrmTools {
  integration: { id: string; name: string; provider: IntegrationProvider } | null;
  data: AgentCrmToolOption[];
}

export interface RetryRule {
  id: string | null;
  agent_uuid: string;
  is_enabled: boolean;
  max_attempts: number;
  /** Minutes to wait before attempt n+2; the last value repeats. */
  delays_minutes: number[];
  retry_on: RetryTrigger[];
  /** `null` = the company calling hours apply. */
  calling_hours_override: Record<string, unknown> | null;
  /** False when defaults are returned for an agent without a stored rule. */
  configured: boolean;
}

/** Calling windows that replace the company's hours for one agent's retries. */
export interface RetryCallingHoursOverride {
  timezone?: string;
  days: { day_of_week: number; start_time: string; end_time: string; is_enabled: boolean }[];
}

export interface UpsertRetryRuleDto {
  is_enabled: boolean;
  max_attempts: number;
  delays_minutes: number[];
  retry_on: RetryTrigger[];
  /** `null` = use the company calling hours. */
  calling_hours_override: RetryCallingHoursOverride | null;
}

export interface AgentAccessMember {
  member_uuid: string;
  role: CompanyRole;
  /** Owners, admins and viewers see every agent whatever is granted. */
  unrestricted: boolean;
  has_access: boolean;
  user: { id: string; name: string | null; email: string };
}

export interface AgentAccessList {
  agent_uuid: string;
  members: AgentAccessMember[];
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  purpose?: string;
  voice?: string;
  language?: string;
  first_message?: string;
  instructions?: string;
  goal?: string;
  success_criteria?: string;
  failure_criteria?: string;
  max_call_duration_seconds?: number;
  crm_integration_uuid?: string | null;
  detect_voicemail?: boolean;
  leave_voicemail?: boolean;
  voicemail_message?: string;
  transfer_enabled?: boolean;
  transfer_on_request?: boolean;
  transfer_on_unresolved?: boolean;
  transfer_number?: string | null;
  transfer_fallback_message?: string;
}

export type UpdateAgentDto = Partial<CreateAgentDto>;

export interface GoalItemInput {
  /** Existing item id; omit to create. */
  id?: string;
  key?: string;
  label: string;
  description?: string;
  requirement?: GoalRequirement;
  data_type?: GoalDataType;
  enum_values?: string[];
}

export interface QuestionInput {
  id?: string;
  question: string;
  is_required?: boolean;
  expected_answer?: string;
}

export interface OutcomeInput {
  id?: string;
  key?: string;
  label: string;
  description?: string;
  is_success?: boolean;
  system_type?: OutcomeSystemType;
}

/** The behavior of an agent as edited on the Behavior step: settings plus the four structured lists. */
export interface SaveAgentBehaviorInput {
  agentId: string;
  settings: UpdateAgentDto;
  goalItems: GoalItemInput[];
  questions: QuestionInput[];
  outcomes: OutcomeInput[];
  /** Positions (in `outcomes`) of the outcomes that hand the call to a human. */
  transferOutcomePositions: number[];
}

/** A ready-made starting point for an agent, described by its job rather than an industry. */
export interface AgentTemplate {
  id: string;
  label: string;
  description: string;
  purpose: string;
  first_message: string;
  instructions: string;
  goal: string;
  success_criteria: string;
  failure_criteria: string;
  goal_items: { label: string; requirement: GoalRequirement; data_type: GoalDataType; enum_values?: string[] }[];
  questions: { question: string; expected_answer?: string }[];
}
