import {
  GoalDataTypes,
  type Agent,
  type AgentTemplate,
  type CreateAgentDto,
  type SaveAgentBehaviorInput,
  type UpdateAgentDto,
} from "@/features/agents/interfaces/agents.interfaces";
import type {
  AgentBasicsFormData,
  AgentBehaviorFormData,
  GoalItemFormData,
} from "@/features/agents/validation-schemas/agents.schema";

const DEFAULT_LANGUAGE = "en";
const SECONDS_PER_MINUTE = 60;

const splitChoices = (value: string): string[] =>
  value
    .split(",")
    .map((choice) => choice.trim())
    .filter(Boolean);

export function toBasicsFormValues(agent: Agent | undefined, template?: AgentTemplate): AgentBasicsFormData {
  return {
    name: agent?.name ?? "",
    description: agent?.description ?? "",
    purpose: agent?.purpose ?? template?.purpose ?? "",
    language: agent?.language ?? DEFAULT_LANGUAGE,
    voice: agent?.voice ?? "",
    first_message: agent?.first_message ?? template?.first_message ?? "",
  };
}

/** Empty optional texts are still sent so clearing a field really clears it. */
export function toBasicsDto(values: AgentBasicsFormData): CreateAgentDto {
  return {
    name: values.name,
    description: values.description,
    purpose: values.purpose,
    language: values.language,
    first_message: values.first_message,
    ...(values.voice ? { voice: values.voice } : {}),
  };
}

const toGoalItemRow = (item: Agent["goal_items"][number]): GoalItemFormData => ({
  id: item.id,
  key: item.key,
  label: item.label,
  requirement: item.requirement,
  data_type: item.data_type,
  enum_values: item.enum_values.join(", "),
});

/**
 * The Behavior step's starting values. A template only fills in a behavior nobody has written yet,
 * so a saved agent is never overwritten by it.
 */
export function toBehaviorFormValues(agent: Agent, template?: AgentTemplate): AgentBehaviorFormData {
  const seed = template && !agent.instructions.trim() ? template : undefined;

  return {
    instructions: agent.instructions || seed?.instructions || "",
    goal: agent.goal ?? seed?.goal ?? "",
    success_criteria: agent.success_criteria ?? seed?.success_criteria ?? "",
    failure_criteria: agent.failure_criteria ?? seed?.failure_criteria ?? "",
    max_call_minutes: agent.max_call_duration_seconds
      ? String(Math.round(agent.max_call_duration_seconds / SECONDS_PER_MINUTE))
      : "",
    detect_voicemail: agent.detect_voicemail,
    leave_voicemail: agent.leave_voicemail,
    voicemail_message: agent.voicemail_message ?? "",
    transfer_enabled: agent.transfer_enabled,
    transfer_on_request: agent.transfer_on_request,
    transfer_on_unresolved: agent.transfer_on_unresolved,
    transfer_number: agent.transfer_number ?? "",
    transfer_fallback_message: agent.transfer_fallback_message ?? "",
    goal_items:
      agent.goal_items.length || !seed
        ? agent.goal_items.map(toGoalItemRow)
        : seed.goal_items.map((item) => ({
            label: item.label,
            requirement: item.requirement,
            data_type: item.data_type,
            enum_values: (item.enum_values ?? []).join(", "),
          })),
    questions:
      agent.questions.length || !seed
        ? agent.questions.map((question) => ({
            id: question.id,
            question: question.question,
            is_required: question.is_required,
            expected_answer: question.expected_answer ?? "",
          }))
        : seed.questions.map((question) => ({
            question: question.question,
            is_required: true,
            expected_answer: question.expected_answer ?? "",
          })),
    outcomes: agent.outcomes.map((outcome) => ({
      id: outcome.id,
      key: outcome.key,
      label: outcome.label,
      is_success: outcome.is_success,
      system_type: outcome.system_type,
      triggers_transfer: outcome.triggers_transfer,
    })),
  };
}

export function toBehaviorSettingsDto(values: AgentBehaviorFormData): UpdateAgentDto {
  return {
    instructions: values.instructions,
    goal: values.goal,
    success_criteria: values.success_criteria,
    failure_criteria: values.failure_criteria,
    detect_voicemail: values.detect_voicemail,
    leave_voicemail: values.leave_voicemail,
    voicemail_message: values.voicemail_message,
    transfer_enabled: values.transfer_enabled,
    transfer_on_request: values.transfer_on_request,
    transfer_on_unresolved: values.transfer_on_unresolved,
    transfer_fallback_message: values.transfer_fallback_message,
    ...(values.max_call_minutes ? { max_call_duration_seconds: Number(values.max_call_minutes) * SECONDS_PER_MINUTE } : {}),
    ...(values.transfer_enabled ? { transfer_number: values.transfer_number } : {}),
  };
}

export function toSaveBehaviorInput(agentId: string, values: AgentBehaviorFormData): SaveAgentBehaviorInput {
  return {
    agentId,
    settings: toBehaviorSettingsDto(values),
    goalItems: values.goal_items.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      ...(item.key ? { key: item.key } : {}),
      label: item.label,
      requirement: item.requirement,
      data_type: item.data_type,
      ...(item.data_type === GoalDataTypes.ENUM ? { enum_values: splitChoices(item.enum_values) } : {}),
    })),
    questions: values.questions.map((question) => ({
      ...(question.id ? { id: question.id } : {}),
      question: question.question,
      is_required: question.is_required,
      expected_answer: question.expected_answer,
    })),
    outcomes: values.outcomes.map((outcome) => ({
      ...(outcome.id ? { id: outcome.id } : {}),
      ...(outcome.key ? { key: outcome.key } : {}),
      label: outcome.label,
      is_success: outcome.is_success,
      ...(outcome.system_type ? { system_type: outcome.system_type } : {}),
    })),
    transferOutcomePositions: values.outcomes.flatMap((outcome, position) =>
      outcome.triggers_transfer ? [position] : [],
    ),
  };
}

/** A blank row for the goal lists; `requirement` decides whether it lands under "must" or "nice". */
export const newGoalItemRow = (requirement: GoalItemFormData["requirement"]): GoalItemFormData => ({
  label: "",
  requirement,
  data_type: GoalDataTypes.STRING,
  enum_values: "",
});
