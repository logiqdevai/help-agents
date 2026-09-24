import { z } from "zod";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export const updateCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(160, "Use at most 160 characters"),
  website: z.string().trim().max(255, "Use at most 255 characters"),
  phone: z.string().trim().max(32, "Use at most 32 characters"),
  timezone: z.string().min(1, "Choose a timezone"),
});
export type UpdateCompanyFormData = z.infer<typeof updateCompanySchema>;

export const callingHoursSchema = z.object({
  days: z
    .array(
      z
        .object({
          day_of_week: z.number().int().min(0).max(6),
          is_enabled: z.boolean(),
          start_time: z.string().regex(TIME_PATTERN, "Enter a valid time"),
          end_time: z.string().regex(TIME_PATTERN, "Enter a valid time"),
        })
        .refine((day) => !day.is_enabled || day.start_time < day.end_time, {
          path: ["end_time"],
          message: "End must be after start",
        }),
    )
    .length(7),
});
export type CallingHoursFormData = z.infer<typeof callingHoursSchema>;

export const recordingRetentionSchema = z.object({
  // "forever" keeps recordings until they are deleted; otherwise the number of days as a string.
  retention: z.string().min(1, "Choose how long to keep recordings"),
});
export type RecordingRetentionFormData = z.infer<typeof recordingRetentionSchema>;

/** The typed company name must match the current name (the API re-checks it, together with the password). */
export const createRequestDeletionSchema = (companyName: string) =>
  z.object({
    company_name: z
      .string()
      .refine((value) => normalizeName(value) === normalizeName(companyName), "Type the company name exactly to confirm"),
    password: z.string().min(1, "Enter your password to confirm"),
  });
export type RequestDeletionFormData = z.infer<ReturnType<typeof createRequestDeletionSchema>>;
