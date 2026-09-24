import { z } from "zod";

const labelSchema = z.string().trim().max(100, "Keep the label under 100 characters");

export const provisionPhoneNumberSchema = z.object({
  country_code: z.string().length(2, "Choose a country"),
  area_code: z
    .string()
    .trim()
    .regex(/^(\d{3})?$/, "An area code has 3 digits"),
  label: labelSchema,
  agent_uuid: z.string(),
});

export type ProvisionPhoneNumberFormData = z.infer<typeof provisionPhoneNumberSchema>;

export const importPhoneNumberSchema = z.object({
  number: z
    .string()
    .trim()
    .regex(/^\+[\d\s().-]{5,}$/, "Enter the number with its country code, e.g. +30 21 5550 1234"),
  termination_uri: z.string().trim().min(3, "Enter your carrier's trunk address").max(255),
  sip_username: z.string().trim().max(255),
  sip_password: z.string().max(255),
  label: labelSchema,
});

export type ImportPhoneNumberFormData = z.infer<typeof importPhoneNumberSchema>;

export const phoneNumberLabelSchema = z.object({ label: labelSchema });

export type PhoneNumberLabelFormData = z.infer<typeof phoneNumberLabelSchema>;

export const assignPhoneNumberAgentSchema = z.object({
  agent_uuid: z.string().min(1, "Choose an agent"),
});

export type AssignPhoneNumberAgentFormData = z.infer<typeof assignPhoneNumberAgentSchema>;
