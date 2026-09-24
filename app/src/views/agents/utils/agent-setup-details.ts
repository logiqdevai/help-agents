import type { Agent, AgentOverview, AgentSetupStep } from "@/features/agents/interfaces/agents.interfaces";
import { formatDate } from "@/lib/format";

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

/** One line per setup step describing what is configured, shown under each tick in the checklist. */
export function getAgentSetupDetails(agent: Agent, overview: AgentOverview): Partial<Record<AgentSetupStep, string>> {
  const goals = agent.goal_items.length;
  const numbers = overview.phone_numbers.map((phone) => phone.number);

  return {
    basics: agent.description || agent.purpose || "Name and voice",
    behavior: [
      "Instructions",
      goals ? pluralize(goals, "goal item") : null,
      agent.questions.length ? pluralize(agent.questions.length, "question") : null,
      pluralize(agent.outcomes.length, "outcome"),
    ]
      .filter(Boolean)
      .join(", "),
    knowledge: agent.knowledge_sources.length
      ? `${pluralize(agent.knowledge_sources.length, "source")} used live in calls`
      : "No knowledge attached",
    crm: agent.crm_integration
      ? `${agent.crm_integration.name} · ${pluralize(agent.crm_tools.length, "action")} allowed`
      : "No CRM connected",
    phone: numbers.length ? numbers.join(", ") : "No number assigned",
    test: overview.readiness.steps.test.complete ? "At least one test call was placed" : "No test call yet",
    activate: agent.activated_at ? `Live since ${formatDate(agent.activated_at)}` : "Not activated yet",
  };
}
