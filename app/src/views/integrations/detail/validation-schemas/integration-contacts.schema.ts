import { z } from "zod";
import { CrmRecordTypes } from "@/features/contacts/interfaces/contacts.interfaces";
import { MaxImportRows, parseContactLines } from "@/views/integrations/detail/utils/contact-import.utils";

const countryCode = z
  .string()
  .trim()
  .refine((value) => !value || /^[A-Za-z]{2}$/.test(value), "Use a 2-letter country code, for example GR");

export const syncContactSchema = z
  .object({
    external_id: z.string().trim().max(200),
    phone: z.string().trim().max(40),
    email: z.union([z.literal(""), z.string().trim().email("Enter a valid email address")]),
    record_type: z.enum([
      CrmRecordTypes.CONTACT,
      CrmRecordTypes.LEAD,
      CrmRecordTypes.COMPANY,
      CrmRecordTypes.DEAL,
      CrmRecordTypes.OTHER,
    ]),
    default_country: countryCode,
  })
  .refine((values) => values.external_id || values.phone || values.email, {
    message: "Enter the CRM reference, a phone number or an email to look up",
    path: ["external_id"],
  });
export type SyncContactFormData = z.infer<typeof syncContactSchema>;

export const importContactsSchema = z.object({
  rows: z
    .string()
    .trim()
    .min(1, "Paste at least one contact")
    .superRefine((text, ctx) => {
      const contacts = parseContactLines(text);
      if (contacts.length > MaxImportRows) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Import at most ${MaxImportRows} contacts at a time` });
        return;
      }
      const missing = contacts.findIndex((contact) => !contact.phone && !contact.email);
      if (missing !== -1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Line ${missing + 1} needs a phone number or an email` });
      }
    }),
  default_country: countryCode,
});
export type ImportContactsFormData = z.infer<typeof importContactsSchema>;
