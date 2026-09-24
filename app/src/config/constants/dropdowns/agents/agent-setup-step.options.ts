import { AgentSetupSteps, type AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";

/** The seven steps of setting an agent up, in order: wizard headings and the "ready to go live" checklist. */
export const AgentSetupStepOptions: { id: AgentSetupStep; label: string; title: string; description: string }[] = [
  {
    id: AgentSetupSteps.BASICS,
    label: "Basics",
    title: "Basics",
    description:
      "Give the agent a name and tell us what it is for. Keep it about the job, not the industry: the same agent type works for sales, support, recruitment, appointments or reservations.",
  },
  {
    id: AgentSetupSteps.BEHAVIOR,
    label: "Behavior",
    title: "Behavior",
    description:
      "Describe how the agent should act, then add structure (goals, questions and outcomes) so results are predictable.",
  },
  {
    id: AgentSetupSteps.KNOWLEDGE,
    label: "Knowledge",
    title: "Knowledge",
    description:
      "Choose which sources this agent can search live during calls, such as pricing, policies and FAQs.",
  },
  {
    id: AgentSetupSteps.CRM,
    label: "CRM",
    title: "CRM",
    description:
      "Connect the agent to your customer database, then choose exactly which actions it is allowed to take there. Nothing else is ever touched.",
  },
  {
    id: AgentSetupSteps.PHONE,
    label: "Phone",
    title: "Phone number",
    description: "Choose the number this agent calls from and answers on.",
  },
  {
    id: AgentSetupSteps.TEST,
    label: "Test",
    title: "Test",
    description:
      "Try the agent out before going live. It is the fastest way to hear how it sounds and check what it does in your CRM.",
  },
  {
    id: AgentSetupSteps.ACTIVATE,
    label: "Activate",
    title: "Review and activate",
    description: "Check the summary below. Activating turns the agent on so it can make and receive calls.",
  },
];

export function getAgentSetupStepLabel(step: AgentSetupStep): string {
  return AgentSetupStepOptions.find((option) => option.id === step)?.label ?? step;
}
