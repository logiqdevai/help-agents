import type { AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";
import { Routes } from "@/routes/routes";

export const WizardParams = {
  AGENT: "agent",
  STEP: "step",
  TEMPLATE: "template",
} as const;

interface WizardLocation {
  agentId: string | null;
  step: AgentSetupStep;
  templateId: string | null;
}

/** The wizard URL that reopens a draft on a given step, so a refresh keeps the user's place. */
export function buildWizardUrl({ agentId, step, templateId }: WizardLocation): string {
  const params = new URLSearchParams();
  if (agentId) params.set(WizardParams.AGENT, agentId);
  params.set(WizardParams.STEP, step);
  if (templateId) params.set(WizardParams.TEMPLATE, templateId);
  return `${Routes.agents.create}?${params.toString()}`;
}
