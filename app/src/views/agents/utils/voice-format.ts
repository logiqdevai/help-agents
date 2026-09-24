import { VoiceGenderFormOptions } from "@/config/constants/dropdowns/agents/voice-gender-form.options";
import type { Voice } from "@/features/voices/interfaces/voices.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

/** "Female · American": the parts of a voice worth showing next to its name. */
export function describeVoice(voice: Pick<Voice, "gender" | "accent">): string {
  return [voice.gender ? getDropdownOptionLabel(VoiceGenderFormOptions, voice.gender) : null, voice.accent]
    .filter(Boolean)
    .join(" · ");
}
