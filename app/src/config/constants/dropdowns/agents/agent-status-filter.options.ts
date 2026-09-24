import { AgentStatusFormOptions } from "@/config/constants/dropdowns/analytics/agent-status-form.options";
import type { AgentStatus } from "@/features/agents/interfaces/agents.interfaces";

export const AgentStatusFilterOptions: { id: AgentStatus | "all"; label: string }[] = [
  { id: "all", label: "All statuses" },
  ...AgentStatusFormOptions,
];
