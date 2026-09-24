import { GoalRequirements, type GoalRequirement } from "@/features/agents/interfaces/agents.interfaces";

export const GoalRequirementFormOptions: { id: GoalRequirement; label: string; description: string }[] = [
  {
    id: GoalRequirements.REQUIRED,
    label: "Must find out",
    description: "The call is not complete until the agent has this.",
  },
  {
    id: GoalRequirements.OPTIONAL,
    label: "Nice to know",
    description: "Collected when it comes up naturally.",
  },
];
