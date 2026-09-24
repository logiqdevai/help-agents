/** Reads the display label for `id` from a `{ id, label }[]` options array; falls back to the raw id. */
export function getDropdownOptionLabel<T extends string>(
  options: ReadonlyArray<{ id: T | "all"; label: string }>,
  id: T | string | null | undefined,
): string {
  if (id === null || id === undefined) return "";
  return options.find((option) => option.id === id)?.label ?? String(id);
}
