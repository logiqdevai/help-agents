export const LanguageFormOptions: { id: string; label: string }[] = [
  { id: "en", label: "English" },
  { id: "el", label: "Ελληνικά (Greek)" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
];

/** The static list plus the caller's current value when it is not part of it. */
export function getLanguageOptions(current?: string | null): { id: string; label: string }[] {
  if (!current || LanguageFormOptions.some((option) => option.id === current)) return LanguageFormOptions;
  return [{ id: current, label: current }, ...LanguageFormOptions];
}
