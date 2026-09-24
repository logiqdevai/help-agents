import { z } from "zod";
import {
  ApiKeyPlacements,
  CustomProviders,
  IntegrationAuthTypes,
  IntegrationProviders,
} from "@/features/integrations/interfaces/integrations.interfaces";

const optionalUrl = z.union([z.literal(""), z.string().trim().url("Enter a valid web address, starting with https://")]);

const nameField = z.string().trim().min(1, "Name is required").max(120, "Use at most 120 characters");

// ---------------------------------------------------------------- credentials (write-only secrets)

const apiKeyFields = {
  auth_type: z.literal(IntegrationAuthTypes.API_KEY),
  api_key: z.string().trim().min(1, "API key is required").max(4000),
  placement: z.enum([ApiKeyPlacements.HEADER, ApiKeyPlacements.QUERY]),
  key_name: z
    .string()
    .trim()
    .min(1, "Enter a name")
    .max(100)
    .regex(/^[A-Za-z0-9_.-]+$/, "Use letters, numbers, dots, dashes and underscores only"),
};

const bearerTokenFields = {
  auth_type: z.literal(IntegrationAuthTypes.BEARER_TOKEN),
  token: z.string().trim().min(1, "Token is required").max(4000),
};

const basicFields = {
  auth_type: z.literal(IntegrationAuthTypes.BASIC),
  username: z.string().trim().min(1, "Username is required").max(500),
  password: z.string().min(1, "Password is required").max(500),
};

const oauth2Fields = {
  auth_type: z.literal(IntegrationAuthTypes.OAUTH2),
  client_id: z.string().trim().min(1, "Client ID is required").max(500),
  client_secret: z.string().min(1, "Client secret is required").max(2000),
  token_url: z.string().trim().url("Enter a valid web address, starting with https://"),
  scope: z.string().trim().max(1000),
};

const customHeadersFields = {
  auth_type: z.literal(IntegrationAuthTypes.CUSTOM_HEADERS),
  headers: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(1, "Header name is required")
          .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
        value: z.string().min(1, "Value is required").max(2000),
      }),
    )
    .min(1, "Add at least one header"),
};

export const credentialsFormSchema = z.discriminatedUnion("auth_type", [
  z.object(apiKeyFields),
  z.object(bearerTokenFields),
  z.object(basicFields),
  z.object(oauth2Fields),
  z.object(customHeadersFields),
]);
export type CredentialsFormData = z.infer<typeof credentialsFormSchema>;

// ---------------------------------------------------------------- new connection

const connectionDetailsFields = {
  name: nameField,
  provider: z.enum([
    IntegrationProviders.HUBSPOT,
    IntegrationProviders.SALESFORCE,
    IntegrationProviders.PIPEDRIVE,
    IntegrationProviders.ZOHO,
    IntegrationProviders.CUSTOM_CRM,
    IntegrationProviders.GENERIC_API,
  ]),
  base_url: optionalUrl,
  api_docs_url: optionalUrl,
};

export const connectionFormSchema = z
  .discriminatedUnion("auth_type", [
    z.object({ ...connectionDetailsFields, ...apiKeyFields }),
    z.object({ ...connectionDetailsFields, ...bearerTokenFields }),
    z.object({ ...connectionDetailsFields, ...basicFields }),
    z.object({ ...connectionDetailsFields, ...oauth2Fields }),
    z.object({ ...connectionDetailsFields, ...customHeadersFields }),
  ])
  .superRefine((values, ctx) => {
    if (CustomProviders.includes(values.provider) && !values.base_url) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["base_url"], message: "Web address is required" });
    }
  });
export type ConnectionFormData = z.infer<typeof connectionFormSchema>;

// ---------------------------------------------------------------- edit details

export const editIntegrationSchema = z.object({
  name: nameField,
  base_url: optionalUrl,
  api_docs_url: optionalUrl,
});
export type EditIntegrationFormData = z.infer<typeof editIntegrationSchema>;
