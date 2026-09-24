import { z } from "zod";
import { ScheduleModes } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";

const MAX_MINUTES = 525_600;

const whenShape = {
  mode: z.nativeEnum(ScheduleModes),
  // Kept as strings so the inputs stay controlled; converted to numbers on submit.
  minutes: z.string(),
  date: z.string(),
};

function validateWhen(value: { mode: string; minutes: string; date: string }, ctx: z.RefinementCtx) {
  if (value.mode === ScheduleModes.AFTER_MINUTES) {
    const minutes = Number(value.minutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MINUTES) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minutes"],
        message: "Enter a whole number of minutes, at least 1",
      });
    }
  }
  if (value.mode === ScheduleModes.DATE) {
    const date = new Date(value.date);
    if (!value.date || Number.isNaN(date.getTime())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Pick a date and time" });
    } else if (date.getTime() <= Date.now()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Pick a time in the future" });
    }
  }
}

export const rescheduleCallSchema = z.object(whenShape).superRefine(validateWhen);
export type RescheduleCallFormData = z.infer<typeof rescheduleCallSchema>;

export const scheduleCallSchema = z
  .object({
    agent_uuid: z.string().min(1, "Choose an agent"),
    contact_uuid: z.string().optional(),
    name: z.string().trim().max(200, "Keep the name under 200 characters"),
    phone: z.string().trim().max(32, "That phone number is too long"),
    ...whenShape,
  })
  .superRefine((value, ctx) => {
    if (!value.contact_uuid && value.phone.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Choose a contact or enter a phone number",
      });
    }
    validateWhen(value, ctx);
  });
export type ScheduleCallFormData = z.infer<typeof scheduleCallSchema>;
