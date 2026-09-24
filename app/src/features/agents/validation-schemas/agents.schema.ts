import { z } from "zod";
import {
  GoalDataTypes,
  GoalRequirements,
  OutcomeSystemTypes,
  RetryHoursModes,
  RetryTriggers,
} from "@/features/agents/interfaces/agents.interfaces";
import { callingHoursSchema } from "@/features/company/validation-schemas/company.schema";

const MAX_CALL_MINUTES = 120;
const PHONE_PATTERN = /^\+?[\d\s().-]{5,}$/;

export const agentBasicsSchema = z.object({
  name: z.string().trim().min(1, "Give the agent a name").max(120, "Keep the name under 120 characters"),
  description: z.string().trim().max(2000, "Keep the description under 2,000 characters"),
  purpose: z.string().trim().max(2000, "Keep the purpose under 2,000 characters"),
  language: z.string().min(2, "Choose a language").max(20),
  /** A voice id from the voice list; empty lets the platform pick a default. */
  voice: z.string(),
  first_message: z.string().trim().max(2000, "Keep the first message under 2,000 characters"),
});
export type AgentBasicsFormData = z.infer<typeof agentBasicsSchema>;

const goalItemSchema = z
  .object({
    id: z.string().optional(),
    key: z.string().optional(),
    label: z.string().trim().min(1, "Describe what the agent should find out").max(200),
    requirement: z.enum([GoalRequirements.REQUIRED, GoalRequirements.OPTIONAL]),
    data_type: z.enum([
      GoalDataTypes.STRING,
      GoalDataTypes.BOOLEAN,
      GoalDataTypes.NUMBER,
      GoalDataTypes.DATE,
      GoalDataTypes.ENUM,
    ]),
    /** Comma-separated choices; only used when the answer type is "Choice". */
    enum_values: z.string().max(1000),
  })
  .superRefine((item, ctx) => {
    if (item.data_type === GoalDataTypes.ENUM && !item.enum_values.split(",").some((value) => value.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["enum_values"], message: "List at least one choice" });
    }
  });
export type GoalItemFormData = z.infer<typeof goalItemSchema>;

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().trim().min(1, "Write the question").max(1000),
  is_required: z.boolean(),
  expected_answer: z.string().trim().max(500, "Keep the expected answer under 500 characters"),
});
export type QuestionFormData = z.infer<typeof questionSchema>;

const outcomeSchema = z.object({
  id: z.string().optional(),
  key: z.string().optional(),
  label: z.string().trim().min(1, "Name the outcome").max(120),
  is_success: z.boolean(),
  system_type: z
    .enum([
      OutcomeSystemTypes.VOICEMAIL,
      OutcomeSystemTypes.NO_ANSWER,
      OutcomeSystemTypes.WRONG_NUMBER,
      OutcomeSystemTypes.UNKNOWN,
    ])
    .nullable(),
  triggers_transfer: z.boolean(),
});
export type OutcomeFormData = z.infer<typeof outcomeSchema>;

export const agentBehaviorSchema = z
  .object({
    instructions: z
      .string()
      .trim()
      .min(1, "Describe how the agent should behave")
      .max(50000, "Keep the instructions under 50,000 characters"),
    goal: z.string().trim().max(2000),
    success_criteria: z.string().trim().max(2000),
    failure_criteria: z.string().trim().max(2000),
    /** Whole minutes; empty leaves the platform default. */
    max_call_minutes: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= MAX_CALL_MINUTES),
        `Enter a whole number of minutes between 1 and ${MAX_CALL_MINUTES}`,
      ),
    detect_voicemail: z.boolean(),
    leave_voicemail: z.boolean(),
    voicemail_message: z.string().trim().max(1000, "Keep the message under 1,000 characters"),
    transfer_enabled: z.boolean(),
    transfer_on_request: z.boolean(),
    transfer_on_unresolved: z.boolean(),
    transfer_number: z.string().trim(),
    transfer_fallback_message: z.string().trim().max(1000, "Keep the message under 1,000 characters"),
    goal_items: z.array(goalItemSchema).max(50, "At most 50 items"),
    questions: z.array(questionSchema).max(50, "At most 50 questions"),
    outcomes: z.array(outcomeSchema).max(50, "At most 50 outcomes"),
  })
  .superRefine((values, ctx) => {
    if (values.leave_voicemail && !values.voicemail_message) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["voicemail_message"],
        message: "Write the message to leave, or turn this off",
      });
    }
    if (values.transfer_enabled && !PHONE_PATTERN.test(values.transfer_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transfer_number"],
        message: "Enter the number to transfer to, with its country code",
      });
    }
  });
export type AgentBehaviorFormData = z.infer<typeof agentBehaviorSchema>;

const MAX_RETRY_ATTEMPTS = 10;
const MAX_RETRY_DELAY_MINUTES = 525600;

export const retryRuleSchema = z
  .object({
    is_enabled: z.boolean(),
    /** Whole attempts including the first call. */
    max_attempts: z
      .string()
      .trim()
      .refine(
        (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= MAX_RETRY_ATTEMPTS,
        `Enter a whole number between 1 and ${MAX_RETRY_ATTEMPTS}`,
      ),
    retry_on: z.array(
      z.enum([RetryTriggers.NO_ANSWER, RetryTriggers.BUSY, RetryTriggers.FAILED, RetryTriggers.VOICEMAIL]),
    ),
    /** One value per gap between attempts, in minutes. */
    delays_minutes: z.array(
      z
        .string()
        .trim()
        .refine(
          (value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= MAX_RETRY_DELAY_MINUTES,
          "Enter the minutes to wait",
        ),
    ),
    hours_mode: z.enum([RetryHoursModes.COMPANY, RetryHoursModes.CUSTOM]),
    days: callingHoursSchema.shape.days,
  })
  .superRefine((values, ctx) => {
    if (values.is_enabled && values.retry_on.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retry_on"],
        message: "Choose at least one reason to try again",
      });
    }
  });
export type RetryRuleFormData = z.infer<typeof retryRuleSchema>;
