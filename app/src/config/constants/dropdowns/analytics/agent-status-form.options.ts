import { AgentStatuses, type AgentStatus } from "@/features/analytics/interfaces/analytics.interfaces";

export const AgentStatusFormOptions: { id: AgentStatus; label: string }[] = [
  { id: AgentStatuses.ACTIVE, label: "Active" },
  { id: AgentStatuses.INACTIVE, label: "Inactive" },
  { id: AgentStatuses.DRAFT, label: "Draft" },
];
