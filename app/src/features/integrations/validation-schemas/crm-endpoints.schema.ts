import { z } from "zod";
import { CrmEndpointKeys, HttpMethods } from "@/features/integrations/interfaces/integrations.interfaces";
import { optionalJsonObject } from "@/features/integrations/validation-schemas/crm-tools.schema";

const crmEndpointRowSchema = z.object({
  key: z.enum([
    CrmEndpointKeys.TEST,
    CrmEndpointKeys.LOOKUP,
    CrmEndpointKeys.UPDATE,
    CrmEndpointKeys.NOTE,
    CrmEndpointKeys.TASK,
    CrmEndpointKeys.FIELDS,
  ]),
  method: z.enum([HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT, HttpMethods.PATCH, HttpMethods.DELETE]),
  /** Blank means the endpoint is not configured. */
  path: z
    .string()
    .trim()
    .max(500)
    .refine((value) => !value || value.startsWith("/"), 'The path must start with "/"'),
  /** Everything else of the endpoint definition (query, body, result_path, …) as JSON. */
  extra: optionalJsonObject,
});

export const crmEndpointsFormSchema = z.object({
  endpoints: z.array(crmEndpointRowSchema),
});
export type CrmEndpointsFormData = z.infer<typeof crmEndpointsFormSchema>;
