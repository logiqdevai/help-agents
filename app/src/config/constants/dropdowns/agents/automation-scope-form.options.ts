import { RuleScopes, type RuleScope } from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** Who an automation rule applies to. */
export const AutomationScopeFormOptions: { id: RuleScope; label: string; description: string }[] = [
  { id: RuleScopes.AGENT, label: "This agent only", description: "Runs for calls made or received by this agent." },
  {
    id: RuleScopes.COMPANY,
    label: "Every agent in my company",
    description: "Runs for all agents. It cannot depend on this agent's outcomes.",
  },
];
