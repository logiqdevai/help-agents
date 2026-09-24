import type { Agent } from "@/features/agents/interfaces/agents.interfaces";

/** What every step of the wizard after the basics receives. */
export interface WizardStepProps {
  agent: Agent;
  onBack: () => void;
  onNext: () => void;
}
