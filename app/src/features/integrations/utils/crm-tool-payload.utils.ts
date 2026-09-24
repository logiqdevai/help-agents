import {
  HttpMethods,
  type CreateCrmToolDto,
  type CrmTool,
  type CrmToolInputSchema,
  type UpdateCrmToolDto,
} from "@/features/integrations/interfaces/integrations.interfaces";
import {
  parseJsonObject,
  type CrmToolFormData,
} from "@/features/integrations/validation-schemas/crm-tools.schema";

const stringify = (value: unknown): string => (value ? JSON.stringify(value, null, 2) : "");

const EmptyToolInputSchema = '{\n  "type": "object",\n  "properties": {},\n  "required": []\n}';

export function toCrmToolFormValues(tool?: CrmTool): CrmToolFormData {
  return {
    key: tool?.key ?? "",
    name: tool?.name ?? "",
    description: tool?.description ?? "",
    category: tool?.category ?? "",
    method: tool?.http?.method ?? HttpMethods.POST,
    path: tool?.http?.path ?? "/",
    query: stringify(tool?.http?.query),
    body: stringify(tool?.http?.body),
    input_schema: tool ? stringify(tool.input_schema) : EmptyToolInputSchema,
    is_active: tool?.is_active ?? true,
  };
}

function toToolFields(values: CrmToolFormData): Omit<CreateCrmToolDto, "key"> {
  const query = parseJsonObject(values.query);
  const body = parseJsonObject(values.body);
  return {
    name: values.name,
    ...(values.description ? { description: values.description } : {}),
    ...(values.category ? { category: values.category } : {}),
    input_schema: parseJsonObject(values.input_schema) as unknown as CrmToolInputSchema,
    http: { method: values.method, path: values.path, ...(query ? { query } : {}), ...(body ? { body } : {}) },
    is_active: values.is_active,
  };
}

export function toCreateCrmToolDto(values: CrmToolFormData): CreateCrmToolDto {
  return { key: values.key, ...toToolFields(values) };
}

export function toUpdateCrmToolDto(values: CrmToolFormData): UpdateCrmToolDto {
  const fields = toToolFields(values);
  // Optional text fields are sent as empty strings so they can be cleared.
  return { ...fields, description: values.description, category: values.category };
}
