import type {
  FieldMapping,
  FieldMappingInput,
} from "@/features/integrations/interfaces/integrations.interfaces";
import type {
  FieldMappingRowFormData,
  FieldMappingsFormData,
} from "@/features/integrations/validation-schemas/field-mappings.schema";

export function toFieldMappingRow(mapping: FieldMapping): FieldMappingRowFormData {
  return {
    internal_field: mapping.internal_field,
    external_field: mapping.external_field,
    external_object: mapping.external_object ?? undefined,
    transform: mapping.transform ?? undefined,
    direction: mapping.direction,
    use_for_personalization: mapping.use_for_personalization,
  };
}

export function toFieldMappingInputs(values: FieldMappingsFormData): FieldMappingInput[] {
  return values.mappings.map((row) => ({
    internal_field: row.internal_field,
    external_field: row.external_field,
    direction: row.direction,
    use_for_personalization: row.use_for_personalization,
    ...(row.external_object ? { external_object: row.external_object } : {}),
    ...(row.transform ? { transform: row.transform } : {}),
  }));
}
