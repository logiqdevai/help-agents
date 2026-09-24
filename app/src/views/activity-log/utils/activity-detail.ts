import { getCompanyRoleLabel } from "@/config/constants/dropdowns/users/company-role-form.options";
import type { ActivityLogEntry } from "@/features/activity-log/interfaces/activity-log.interfaces";

const asText = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

/** Short extra context taken from the entry's metadata (changed fields, role, error), or null. */
export function getActivityDetail(entry: ActivityLogEntry): string | null {
  const { metadata } = entry;
  if (!metadata) return null;

  const fields = Array.isArray(metadata.fields)
    ? metadata.fields.filter((field): field is string => typeof field === "string")
    : [];
  if (fields.length) return fields.map((field) => field.replace(/_/g, " ")).join(", ");

  const role = asText(metadata.role);
  if (role) return `as ${getCompanyRoleLabel(role).toLowerCase()}`;

  const section = asText(metadata.section);
  if (section) return section.replace(/_/g, " ");

  return asText(metadata.error);
}
