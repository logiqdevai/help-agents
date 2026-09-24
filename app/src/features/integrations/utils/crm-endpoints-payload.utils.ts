import {
  CrmEndpointKeys,
  HttpMethods,
  type EndpointSpec,
  type GenericApiConfig,
  type Integration,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { parseJsonObject } from "@/features/integrations/validation-schemas/crm-tools.schema";
import type { CrmEndpointsFormData } from "@/features/integrations/validation-schemas/crm-endpoints.schema";

export function toCrmEndpointsFormValues(config: Integration["config"]): CrmEndpointsFormData {
  const stored = (config ?? {}) as GenericApiConfig;
  return {
    endpoints: Object.values(CrmEndpointKeys).map((id) => {
      const { method, path, ...extra } = stored[id] ?? { path: "" };
      return {
        key: id,
        method: method ?? HttpMethods.GET,
        path,
        extra: Object.keys(extra).length ? JSON.stringify(extra, null, 2) : "",
      };
    }),
  };
}

/** Endpoints left without a path are not configured and are omitted from the saved definition. */
export function toGenericApiConfig(values: CrmEndpointsFormData): GenericApiConfig {
  const config: GenericApiConfig = {};
  for (const row of values.endpoints) {
    if (!row.path) continue;
    const spec: EndpointSpec = { ...parseJsonObject(row.extra), method: row.method, path: row.path };
    config[row.key] = spec;
  }
  return config;
}
