import type { IntegrationAgent } from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationAgentStatusOptions: { id: IntegrationAgent["status"]; label: string }[] = [
  { id: "DRAFT", label: "Draft" },
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
];
