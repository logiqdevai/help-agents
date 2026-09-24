import { z } from "zod";
import { GoalFieldPrefix, MappingDirections } from "@/features/integrations/interfaces/integrations.interfaces";

const goalFieldPattern = new RegExp(`^${GoalFieldPrefix.replace(".", "\\.")}[a-zA-Z0-9_]{1,64}$`);

const fieldMappingRowSchema = z.object({
  internal_field: z
    .string()
    .min(1, "Choose one of our fields")
    .refine(
      (value) => !value.startsWith(GoalFieldPrefix) || goalFieldPattern.test(value),
      "Use letters, numbers and underscores for the goal item key",
    ),
  external_field: z.string().trim().min(1, "Enter the field name in your CRM").max(200),
  // Not edited in the UI; carried through so saving does not drop them.
  external_object: z.string().optional(),
  transform: z.record(z.unknown()).optional(),
  direction: z.enum([MappingDirections.READ, MappingDirections.WRITE, MappingDirections.BOTH]),
  use_for_personalization: z.boolean(),
});
export type FieldMappingRowFormData = z.infer<typeof fieldMappingRowSchema>;

export const fieldMappingsFormSchema = z.object({
  mappings: z.array(fieldMappingRowSchema).max(200, "At most 200 mappings"),
});
export type FieldMappingsFormData = z.infer<typeof fieldMappingsFormSchema>;
