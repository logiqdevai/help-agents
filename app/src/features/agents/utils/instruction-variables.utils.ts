import type { FieldMapping } from "@/features/integrations/interfaces/integrations.interfaces";

/** The placeholder name of a CRM field marked for personalization: "goal.budget" -> "goal_budget". */
export const personalizationVariableKey = (internalField: string): string =>
  internalField.replace(/[^a-zA-Z0-9_]/g, "_");

/** Placeholder names of the CRM fields that are given to the agent before each call. */
export function getPersonalizationVariables(mappings: FieldMapping[]): string[] {
  return [
    ...new Set(
      mappings
        .filter((mapping) => mapping.use_for_personalization)
        .map((mapping) => personalizationVariableKey(mapping.internal_field)),
    ),
  ];
}
