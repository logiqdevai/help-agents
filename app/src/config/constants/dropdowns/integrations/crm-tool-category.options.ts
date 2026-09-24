const CrmToolCategoryOptions: { id: string; label: string; readOnly: boolean }[] = [
  { id: "lookup", label: "Look up", readOnly: true },
  { id: "update", label: "Update", readOnly: false },
  { id: "notes", label: "Notes", readOnly: false },
  { id: "activity", label: "Activity", readOnly: false },
  { id: "tasks", label: "Tasks", readOnly: false },
];

export function getCrmToolCategoryLabel(category: string | null): string {
  if (!category) return "Other";
  return CrmToolCategoryOptions.find((option) => option.id === category)?.label ?? category;
}

/** Look-up tools only read from the CRM; every other category changes data. */
export function isCrmToolReadOnly(category: string | null): boolean {
  return CrmToolCategoryOptions.find((option) => option.id === category)?.readOnly ?? false;
}
