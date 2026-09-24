import {
  AutomationActionTypes,
  AutomationTriggers,
  DelayUnits,
  MinutesPerDelayUnit,
  RecipientModes,
  RuleScopes,
  WebhookIncludeKeys,
  type AutomationAction,
  type AutomationActionInput,
  type AutomationActionType,
  type AutomationRule,
  type CreateAutomationRuleDto,
  type DelayUnit,
  type RuleScope,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import type {
  AutomationActionFormData,
  AutomationRuleFormData,
} from "@/features/automation-rules/validation-schemas/automation-rules.schema";

const MINUTES_PER_DAY = MinutesPerDelayUnit[DelayUnits.DAYS];
const MINUTES_PER_HOUR = MinutesPerDelayUnit[DelayUnits.HOURS];
const DEFAULT_EVENT_MINUTES = "30";
const DEFAULT_NOTE = "{{call.summary}}";
const DEFAULT_WEBHOOK_INCLUDE = [WebhookIncludeKeys.CALL, WebhookIncludeKeys.CONTACT, WebhookIncludeKeys.GATHERED];

const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);
const asNumberText = (value: unknown): string => (typeof value === "number" ? String(value) : "");
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

/** 1440 -> 1 day; 90 -> 90 minutes: the largest unit that divides the wait evenly. */
export function splitDelay(totalMinutes: number): { value: string; unit: DelayUnit } {
  if (totalMinutes > 0 && totalMinutes % MINUTES_PER_DAY === 0) {
    return { value: String(totalMinutes / MINUTES_PER_DAY), unit: DelayUnits.DAYS };
  }
  if (totalMinutes > 0 && totalMinutes % MINUTES_PER_HOUR === 0) {
    return { value: String(totalMinutes / MINUTES_PER_HOUR), unit: DelayUnits.HOURS };
  }
  return { value: String(totalMinutes), unit: DelayUnits.MINUTES };
}

/** A blank action of the given type with sensible starting values. */
export function newActionRow(type: AutomationActionType): AutomationActionFormData {
  return {
    type,
    delay_value: "0",
    delay_unit: DelayUnits.MINUTES,
    crm_fields: [],
    body: type === AutomationActionTypes.ADD_CRM_NOTE ? DEFAULT_NOTE : "",
    title: "",
    task_notes: "",
    due_in_days: "",
    reason: "",
    follow_up_agent_uuid: "",
    start_from: "",
    duration_minutes: DEFAULT_EVENT_MINUTES,
    attendee_email: "",
    recipient_mode: RecipientModes.CONTACT,
    recipient: "",
    subject: "",
    url: "",
    headers: [],
    include: [...DEFAULT_WEBHOOK_INCLUDE],
  };
}

function toActionRow(action: AutomationAction): AutomationActionFormData {
  const config = asRecord(action.config);
  const row = newActionRow(action.type);
  const delay = splitDelay(action.delay_minutes);
  const recipient = asText(config.to);
  const recipientFields =
    recipient === RecipientModes.CONTACT || !recipient
      ? { recipient_mode: RecipientModes.CONTACT, recipient: "" }
      : { recipient_mode: RecipientModes.CUSTOM, recipient };

  switch (action.type) {
    case AutomationActionTypes.UPDATE_CRM:
      return {
        ...row,
        delay_value: delay.value,
        delay_unit: delay.unit,
        crm_fields: Object.entries(asRecord(config.fields)).map(([name, value]) => ({
          name,
          value: value === null || value === undefined ? "" : String(value),
        })),
      };
    case AutomationActionTypes.ADD_CRM_NOTE:
      return { ...row, delay_value: delay.value, delay_unit: delay.unit, body: asText(config.note) };
    case AutomationActionTypes.CREATE_CRM_TASK:
      return {
        ...row,
        delay_value: delay.value,
        delay_unit: delay.unit,
        title: asText(config.title),
        due_in_days: asNumberText(config.due_in_days),
        task_notes: asText(config.notes),
      };
    case AutomationActionTypes.SCHEDULE_FOLLOW_UP: {
      const total =
        asNumber(config.delay_minutes) + asNumber(config.delay_days) * MINUTES_PER_DAY + action.delay_minutes;
      const wait = splitDelay(total);
      return {
        ...row,
        delay_value: wait.value,
        delay_unit: wait.unit,
        follow_up_agent_uuid: asText(config.agent_uuid),
        reason: asText(config.reason),
      };
    }
    case AutomationActionTypes.CREATE_CALENDAR_EVENT:
      return {
        ...row,
        delay_value: delay.value,
        delay_unit: delay.unit,
        title: asText(config.title),
        duration_minutes: asNumberText(config.duration_minutes) || DEFAULT_EVENT_MINUTES,
        start_from: asText(config.start_from),
        attendee_email: asText(config.attendee_email),
      };
    case AutomationActionTypes.SEND_EMAIL:
      return {
        ...row,
        ...recipientFields,
        delay_value: delay.value,
        delay_unit: delay.unit,
        subject: asText(config.subject),
        body: asText(config.body),
      };
    case AutomationActionTypes.SEND_SMS:
      return { ...row, ...recipientFields, delay_value: delay.value, delay_unit: delay.unit, body: asText(config.body) };
    case AutomationActionTypes.WEBHOOK:
      return {
        ...row,
        delay_value: delay.value,
        delay_unit: delay.unit,
        url: asText(config.url),
        headers: Object.entries(asRecord(config.headers)).map(([name, value]) => ({ name, value: asText(value) })),
        include: Array.isArray(config.include)
          ? config.include.filter((key): key is AutomationActionFormData["include"][number] =>
              Object.values(WebhookIncludeKeys).includes(key),
            )
          : row.include,
      };
    default:
      return { ...row, delay_value: delay.value, delay_unit: delay.unit };
  }
}

/** The form's starting values: a saved rule as it is, or a blank rule for the given scope. */
export function toRuleFormValues(rule: AutomationRule | undefined, scope: RuleScope): AutomationRuleFormData {
  if (!rule) {
    return { name: "", trigger: AutomationTriggers.CALL_OUTCOME, scope, outcome_uuid: "", actions: [] };
  }
  return {
    name: rule.name,
    trigger: rule.trigger,
    scope: rule.agent_uuid ? RuleScopes.AGENT : RuleScopes.COMPANY,
    outcome_uuid: rule.outcome_uuid ?? "",
    actions: rule.actions.map(toActionRow),
  };
}

function toActionInput(row: AutomationActionFormData): AutomationActionInput {
  const waitMinutes = Number(row.delay_value) * MinutesPerDelayUnit[row.delay_unit];
  const to = row.recipient_mode === RecipientModes.CONTACT ? RecipientModes.CONTACT : row.recipient;

  switch (row.type) {
    case AutomationActionTypes.UPDATE_CRM:
      return {
        type: row.type,
        delay_minutes: waitMinutes,
        config: row.crm_fields.length
          ? { fields: Object.fromEntries(row.crm_fields.map(({ name, value }) => [name, value])) }
          : {},
      };
    case AutomationActionTypes.ADD_CRM_NOTE:
      return { type: row.type, delay_minutes: waitMinutes, config: { note: row.body } };
    case AutomationActionTypes.CREATE_CRM_TASK:
      return {
        type: row.type,
        delay_minutes: waitMinutes,
        config: {
          title: row.title,
          ...(row.due_in_days ? { due_in_days: Number(row.due_in_days) } : {}),
          ...(row.task_notes.trim() ? { notes: row.task_notes } : {}),
        },
      };
    case AutomationActionTypes.SCHEDULE_FOLLOW_UP:
      // The wait is part of the follow-up itself, so the action runs right away and books the call.
      return {
        type: row.type,
        delay_minutes: 0,
        config: {
          delay_minutes: waitMinutes,
          ...(row.follow_up_agent_uuid ? { agent_uuid: row.follow_up_agent_uuid } : {}),
          ...(row.reason ? { reason: row.reason } : {}),
        },
      };
    case AutomationActionTypes.CANCEL_FOLLOW_UPS:
      return { type: row.type, delay_minutes: waitMinutes, config: {} };
    case AutomationActionTypes.CREATE_CALENDAR_EVENT:
      return {
        type: row.type,
        delay_minutes: waitMinutes,
        config: {
          title: row.title,
          duration_minutes: Number(row.duration_minutes),
          start_from: row.start_from,
          ...(row.attendee_email ? { attendee_email: row.attendee_email } : {}),
        },
      };
    case AutomationActionTypes.SEND_EMAIL:
      return { type: row.type, delay_minutes: waitMinutes, config: { to, subject: row.subject, body: row.body } };
    case AutomationActionTypes.SEND_SMS:
      return {
        type: row.type,
        delay_minutes: waitMinutes,
        config: { to: to.includes("{{") ? to : to.replace(/\s/g, ""), body: row.body },
      };
    default:
      return {
        type: row.type,
        delay_minutes: waitMinutes,
        config: {
          url: row.url,
          include: row.include,
          ...(row.headers.length
            ? { headers: Object.fromEntries(row.headers.map(({ name, value }) => [name, value])) }
            : {}),
        },
      };
  }
}

export function toRuleDto(values: AutomationRuleFormData, agentId: string): CreateAutomationRuleDto {
  const isAgentRule = values.scope === RuleScopes.AGENT;
  return {
    name: values.name,
    trigger: values.trigger,
    agent_uuid: isAgentRule ? agentId : null,
    outcome_uuid:
      isAgentRule && values.trigger === AutomationTriggers.CALL_OUTCOME && values.outcome_uuid
        ? values.outcome_uuid
        : null,
    actions: values.actions.map(toActionInput),
  };
}
