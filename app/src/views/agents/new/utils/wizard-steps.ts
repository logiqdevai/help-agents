import { AgentSetupStepOptions } from "@/config/constants/dropdowns/agents/agent-setup-step.options";
import type { AgentReadiness, AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";

export const WizardStepOrder: AgentSetupStep[] = AgentSetupStepOptions.map((option) => option.id);

export const getWizardStepIndex = (step: AgentSetupStep): number => WizardStepOrder.indexOf(step);

/** Whether `value` (from a URL) is one of the wizard's steps. */
export const isWizardStep = (value: string | null): value is AgentSetupStep =>
  WizardStepOrder.some((step) => step === value);

/** Where to pick a draft up again: the first step that is not done yet. */
export function getResumeStep(readiness: AgentReadiness): AgentSetupStep {
  return WizardStepOrder.find((step) => !readiness.steps[step].complete) ?? WizardStepOrder[WizardStepOrder.length - 1];
}
