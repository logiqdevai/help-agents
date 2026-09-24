import { z } from "zod";

export const callFormSchema = z.object({
  agent_uuid: z.string().min(1, "Choose an agent"),
  contact_uuid: z.string().optional(),
  name: z.string().trim().max(200, "Keep the name under 200 characters"),
  phone: z.string().trim().max(32, "That phone number is too long"),
});

export type CallFormData = z.infer<typeof callFormSchema>;

/** A test call rings the person who is trying the agent, so both name and number are needed. */
export const testCallSchema = callFormSchema.superRefine((value, ctx) => {
  if (!value.name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Enter a name" });
  if (value.phone.length < 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Enter a phone number" });
  }
});

/** A live call needs someone to dial: a CRM contact or a typed number. */
export const placeCallSchema = callFormSchema.superRefine((value, ctx) => {
  if (!value.contact_uuid && value.phone.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["phone"],
      message: "Choose a contact or enter a phone number",
    });
  }
});
