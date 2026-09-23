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
  steps: {
    basics: ReadinessStep;
    behavior: ReadinessStep;
    knowledge: ReadinessStep;
    crm: ReadinessStep;
    phone: ReadinessStep;
    test: ReadinessStep;
    activate: ReadinessStep;
  };
}

export interface AgentListItem {
  id: string;
  name: string;
  description: string | null;
  purpose: string | null;
  status: string;
  language: string;
  voice: string | null;
  crm_integration: { id: string; name: string; provider: string } | null;
  phone_numbers: Array<{ id: string; number: string }>;
  knowledge_sources_count: number;
  calls_made: number;
  success_rate: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface AgentOverview {
  id: string;
  name: string;
  status: string;
  goal: string | null;
  knowledge_sources_count: number;
  crm_integration: { id: string; name: string; provider: string } | null;
  phone_numbers: Array<{ id: string; number: string }>;
  voice: string | null;
  language: string;
  calls_made: number;
  success_rate: number | null;
  average_duration_seconds: number | null;
  average_cost: number | null;
  currency: string;
  last_call_at: Date | null;
  readiness: AgentReadiness;
  unresolved_alerts: number;
}
