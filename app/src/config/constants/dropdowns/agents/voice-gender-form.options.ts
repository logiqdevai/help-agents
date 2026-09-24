import type { VoicesQuery } from "@/features/voices/interfaces/voices.interfaces";

type VoiceGender = NonNullable<VoicesQuery["gender"]>;

export const VoiceGenderFormOptions: { id: VoiceGender; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
];

export const VoiceGenderFilterOptions: { id: VoiceGender | "all"; label: string }[] = [
  { id: "all", label: "Any voice" },
  ...VoiceGenderFormOptions,
];
