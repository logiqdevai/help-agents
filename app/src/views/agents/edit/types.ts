import type { AgentEditTab } from "@/config/constants/dropdowns/agents/agent-edit-tab.options";

/** The parts of the edit page that keep unsaved changes of their own. */
export const EditSections = {
  BASICS: "basics",
  BEHAVIOR: "behavior",
  KNOWLEDGE: "knowledge",
  CRM: "crm",
  RETRIES: "retries",
  ACCESS: "access",
} as const;
export type EditSection = (typeof EditSections)[keyof typeof EditSections];

/** Called by a section whenever it gains or loses unsaved changes. */
export type SetSectionDirty = (section: EditSection, isDirty: boolean) => void;

/** Which section a tab belongs to; tabs that save instantly (phone, automations) have none. */
export const TabSections: Partial<Record<AgentEditTab, EditSection>> = {
  general: EditSections.BASICS,
  instructions: EditSections.BEHAVIOR,
  goals: EditSections.BEHAVIOR,
  outcomes: EditSections.BEHAVIOR,
  knowledge: EditSections.KNOWLEDGE,
  crm: EditSections.CRM,
  retries: EditSections.RETRIES,
  access: EditSections.ACCESS,
};
