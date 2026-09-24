import { z } from "zod";
import { HttpMethods } from "@/features/integrations/interfaces/integrations.interfaces";

export const parseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};

/** Optional JSON text field: blank, or a JSON object. */
export const optionalJsonObject = z
  .string()
  .refine((value) => !value.trim() || parseJsonObject(value) !== null, "Enter a valid JSON object");

export const crmToolFormSchema = z.object({
  key: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9_]{2,63}$/, "Use snake_case, 3 to 64 characters (for example add_customer_note)"),
  name: z.string().trim().min(1, "Name is required").max(120, "Use at most 120 characters"),
  description: z.string().trim().max(1000, "Use at most 1000 characters"),
  category: z.string().trim().max(60, "Use at most 60 characters"),
  method: z.enum([HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH, HttpMethods.DELETE]),
  path: z
    .string()
    .trim()
    .max(500)
    .regex(/^\//, 'The path must start with "/"'),
  query: optionalJsonObject,
  body: optionalJsonObject,
  input_schema: z
    .string()
    .refine((value) => parseJsonObject(value)?.type === "object", 'Enter a JSON schema with "type": "object"'),
  is_active: z.boolean(),
});
export type CrmToolFormData = z.infer<typeof crmToolFormSchema>;
