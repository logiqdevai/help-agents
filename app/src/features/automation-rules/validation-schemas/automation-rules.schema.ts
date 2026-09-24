import { z } from "zod";
import {
  AutomationActionTypes,
  AutomationTriggers,
  DelayUnits,
  MinutesPerDelayUnit,
  RecipientModes,
  RuleScopes,
  WebhookIncludeKeys,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";

/** The API allows a delay of 30 days; a follow-up call may be scheduled up to a year ahead. */
const MAX_DELAY_MINUTES = 43200;
const MAX_FOLLOW_UP_MINUTES = 525600;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/;
const HEADER_NAME_PATTERN = /^[A-Za-z0-9-]+$/;
const WHOLE_NUMBER = /^\d+$/;

/** A recipient may be a fixed address or a placeholder filled in for each call. */
const hasPlaceholder = (value: string) => value.includes("{{");

const actionTypeSchema = z.enum([
  AutomationActionTypes.UPDATE_CRM,
  AutomationActionTypes.ADD_CRM_NOTE,
  AutomationActionTypes.CREATE_CRM_TASK,
  AutomationActionTypes.SCHEDULE_FOLLOW_UP,
  AutomationActionTypes.CANCEL_FOLLOW_UPS,
  AutomationActionTypes.CREATE_CALENDAR_EVENT,
  AutomationActionTypes.SEND_EMAIL,
  AutomationActionTypes.SEND_SMS,
  AutomationActionTypes.WEBHOOK,
]);

/**
 * One row shape for every action type: the form keeps the settings of all types so switching the
 * type loses nothing, and only the fields of the chosen type are validated and sent.
 */
const automationActionSchema = z
  .object({
    type: actionTypeSchema,
    /** How long to wait before the action runs (for a follow-up call: how long until the call); 0 = right away. */
    delay_value: z.string().trim(),
    delay_unit: z.enum([DelayUnits.MINUTES, DelayUnits.HOURS, DelayUnits.DAYS]),
    crm_fields: z.array(
      z.object({ name: z.string().trim().max(100, "Keep the field name short"), value: z.string().max(500) }),
    ),
    /** The note, email or text message body. */
    body: z.string().max(5000, "Keep it under 5,000 characters"),
    /** The task or calendar event title. */
    title: z.string().trim().max(300, "Keep the title under 300 characters"),
    task_notes: z.string().max(5000, "Keep it under 5,000 characters"),
    due_in_days: z.string().trim(),
    reason: z.string().trim().max(500, "Keep it under 500 characters"),
    /** Empty = the agent that made the call. */
    follow_up_agent_uuid: z.string(),
    start_from: z.string().trim().max(200),
    duration_minutes: z.string().trim(),
    attendee_email: z.string().trim().max(320),
    recipient_mode: z.enum([RecipientModes.CONTACT, RecipientModes.CUSTOM]),
    recipient: z.string().trim().max(320),
    subject: z.string().trim().max(300, "Keep the subject under 300 characters"),
    url: z.string().trim().max(2000),
    headers: z
      .array(z.object({ name: z.string().trim(), value: z.string().max(1000) }))
      .max(10, "At most 10 headers"),
    include: z.array(
      z.enum([
        WebhookIncludeKeys.CALL,
        WebhookIncludeKeys.CONTACT,
        WebhookIncludeKeys.GATHERED,
        WebhookIncludeKeys.SUMMARY,
        WebhookIncludeKeys.TRANSCRIPT,
      ]),
    ),
  })
  .superRefine((action, ctx) => {
    const fail = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    const requireText = (field: "body" | "title" | "subject" | "start_from" | "duration_minutes", message: string) => {
      if (!action[field].trim()) fail([field], message);
    };
    const requireWholeNumber = (field: "due_in_days" | "duration_minutes", min: number, max: number, message: string) => {
      const value = action[field];
      if (value && !(WHOLE_NUMBER.test(value) && Number(value) >= min && Number(value) <= max)) fail([field], message);
    };

    if (!WHOLE_NUMBER.test(action.delay_value)) {
      fail(["delay_value"], "Enter a whole number, or 0 to run right away");
    } else {
      const limit =
        action.type === AutomationActionTypes.SCHEDULE_FOLLOW_UP ? MAX_FOLLOW_UP_MINUTES : MAX_DELAY_MINUTES;
      if (Number(action.delay_value) * MinutesPerDelayUnit[action.delay_unit] > limit) {
        fail(["delay_value"], limit === MAX_DELAY_MINUTES ? "Wait at most 30 days" : "Schedule at most a year ahead");
      }
    }

    switch (action.type) {
      case AutomationActionTypes.UPDATE_CRM:
        action.crm_fields.forEach((row, index) => {
          if (!row.name) fail(["crm_fields", index, "name"], "Name the CRM field");
        });
        break;
      case AutomationActionTypes.ADD_CRM_NOTE:
        requireText("body", "Write the note");
        break;
      case AutomationActionTypes.CREATE_CRM_TASK:
        requireText("title", "Give the task a title");
        requireWholeNumber("due_in_days", 0, 365, "Enter days between 0 and 365");
        break;
      case AutomationActionTypes.CREATE_CALENDAR_EVENT:
        requireText("title", "Give the event a title");
        requireText("start_from", "Say where the start time comes from");
        requireText("duration_minutes", "Enter the length in minutes");
        requireWholeNumber("duration_minutes", 5, 1440, "Enter minutes between 5 and 1,440");
        if (action.attendee_email && !hasPlaceholder(action.attendee_email) && !EMAIL_PATTERN.test(action.attendee_email)) {
          fail(["attendee_email"], "Enter a valid email address");
        }
        break;
      case AutomationActionTypes.SEND_EMAIL:
        requireText("subject", "Write the subject");
        requireText("body", "Write the message");
        if (action.recipient_mode === RecipientModes.CUSTOM) {
          if (!action.recipient) fail(["recipient"], "Enter the email address");
          else if (!hasPlaceholder(action.recipient) && !EMAIL_PATTERN.test(action.recipient)) {
            fail(["recipient"], "Enter a valid email address");
          }
        }
        break;
      case AutomationActionTypes.SEND_SMS:
        requireText("body", "Write the message");
        if (action.recipient_mode === RecipientModes.CUSTOM) {
          if (!action.recipient) fail(["recipient"], "Enter the phone number");
          else if (!hasPlaceholder(action.recipient) && !PHONE_PATTERN.test(action.recipient.replace(/\s/g, ""))) {
            fail(["recipient"], "Enter the number with its country code, e.g. +302155501001");
          }
        }
        break;
      case AutomationActionTypes.WEBHOOK:
        if (!action.url.startsWith("https://")) fail(["url"], "Enter a web address starting with https://");
        action.headers.forEach((header, index) => {
          if (!HEADER_NAME_PATTERN.test(header.name)) fail(["headers", index, "name"], "Use letters, numbers and dashes");
        });
        break;
      default:
        break;
    }
  });
export type AutomationActionFormData = z.infer<typeof automationActionSchema>;

export const automationRuleSchema = z.object({
  name: z.string().trim().min(1, "Name the rule").max(200, "Keep the name under 200 characters"),
  trigger: z.enum([
    AutomationTriggers.CALL_OUTCOME,
    AutomationTriggers.CALL_COMPLETED,
    AutomationTriggers.CALL_FAILED,
    AutomationTriggers.CALL_TRANSFERRED,
    AutomationTriggers.VOICEMAIL_DETECTED,
  ]),
  scope: z.enum([RuleScopes.AGENT, RuleScopes.COMPANY]),
  /** Empty = any outcome. */
  outcome_uuid: z.string(),
  actions: z.array(automationActionSchema).min(1, "Add at least one action").max(20, "At most 20 actions"),
});
export type AutomationRuleFormData = z.infer<typeof automationRuleSchema>;
