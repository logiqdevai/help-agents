/** The sections of the agent edit page, in tab order. */
export const AgentEditTabOptions = [
  { id: "general", label: "General" },
  { id: "instructions", label: "Instructions" },
  { id: "goals", label: "Goals & questions" },
  { id: "outcomes", label: "Outcomes & transfer" },
  { id: "knowledge", label: "Knowledge" },
  { id: "crm", label: "CRM" },
  { id: "phone", label: "Phone" },
  { id: "retries", label: "Scheduling & retries" },
  { id: "automations", label: "Automations" },
  { id: "access", label: "Access" },
] as const;

export type AgentEditTab = (typeof AgentEditTabOptions)[number]["id"];
