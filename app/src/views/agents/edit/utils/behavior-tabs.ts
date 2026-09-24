import type { FieldErrors } from "react-hook-form";
import type { AgentEditTab } from "@/config/constants/dropdowns/agents/agent-edit-tab.options";
import type { AgentBehaviorFormData } from "@/features/agents/validation-schemas/agents.schema";

/** Which tab shows each field of the behavior form, so a failed save can point at the right one. */
const FIELD_TABS: Record<keyof AgentBehaviorFormData, AgentEditTab> = {
  instructions: "instructions",
  goal: "goals",
  success_criteria: "goals",
  failure_criteria: "goals",
  max_call_minutes: "goals",
  goal_items: "goals",
  questions: "goals",
  outcomes: "outcomes",
  detect_voicemail: "outcomes",
  leave_voicemail: "outcomes",
  voicemail_message: "outcomes",
  transfer_enabled: "outcomes",
  transfer_on_request: "outcomes",
  transfer_on_unresolved: "outcomes",
  transfer_number: "outcomes",
  transfer_fallback_message: "outcomes",
};

/** The tab of the first field with an error, or undefined when nothing is wrong. */
export function findTabWithErrors(errors: FieldErrors<AgentBehaviorFormData>): AgentEditTab | undefined {
  const [field] = Object.keys(errors) as (keyof AgentBehaviorFormData)[];
  return field ? FIELD_TABS[field] : undefined;
}
