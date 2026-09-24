"use client";

import { useMemo, useState, type FC } from "react";
import { PauseIcon, PlayIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { VoiceGenderFilterOptions } from "@/config/constants/dropdowns/agents/voice-gender-form.options";
import { useGetVoices } from "@/features/voices/hooks/use-voices";
import type { Voice, VoicesQuery } from "@/features/voices/interfaces/voices.interfaces";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAudioPreview } from "../hooks/use-audio-preview";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { describeVoice } from "../utils/voice-format";

const COLLAPSED_COUNT = 6;

interface VoicePickerProps {
  /** The chosen voice id; empty when none is chosen. */
  value: string;
  onChange: (voiceId: string) => void;
  disabled?: boolean;
}

/** Searchable list of voices with a preview button on each; pick one with the radio buttons. */
export const VoicePicker: FC<VoicePickerProps> = ({ value, onChange, disabled }) => {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<NonNullable<VoicesQuery["gender"]> | "all">("all");
  const [expanded, setExpanded] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim());
  const voices = useGetVoices({ search: debouncedSearch, gender: gender === "all" ? undefined : gender });
  const allVoices = useGetVoices();
  const preview = useAudioPreview();

  // The chosen voice stays on screen even when the filters would hide it.
  const visible = useMemo<Voice[]>(() => {
    const list = voices.data ?? [];
    const chosen = allVoices.data?.find((voice) => voice.voice_id === value);
    const withChosen = chosen && !list.some((voice) => voice.voice_id === value) ? [chosen, ...list] : list;
    return expanded ? withChosen : withChosen.slice(0, COLLAPSED_COUNT);
  }, [voices.data, allVoices.data, value, expanded]);

  const total = voices.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-44 flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-8"
            placeholder="Search voices"
            aria-label="Search voices"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <NativeSelect
          aria-label="Filter voices"
          value={gender}
          onChange={(event) => setGender(event.target.value as typeof gender)}
        >
          {VoiceGenderFilterOptions.map((option) => (
            <NativeSelectOption key={option.id} value={option.id}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {voices.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: COLLAPSED_COUNT }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : voices.isError ? (
        <ErrorState title="Could not load voices" message={voices.error.message} onRetry={() => voices.refetch()} />
      ) : visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No voices match your search.
        </p>
      ) : (
        <div role="radiogroup" aria-label="Voice" className="flex flex-col gap-2">
          {visible.map((voice) => {
            const selected = voice.voice_id === value;
            const previewUrl = voice.preview_audio_url;
            const isPlaying = !!previewUrl && preview.playingUrl === previewUrl;
            const details = describeVoice(voice);
            return (
              <label
                key={voice.voice_id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  selected ? "border-foreground" : "border-border hover:border-hairline-strong",
                )}
              >
                <input
                  type="radio"
                  name="agent-voice"
                  value={voice.voice_id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => onChange(voice.voice_id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium"
                >
                  {initialsOf(voice.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{voice.name}</span>
                  {details ? <span className="block truncate text-sm text-muted-foreground">{details}</span> : null}
                </span>
                {previewUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`${isPlaying ? "Stop the preview of" : "Preview"} ${voice.name}`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      preview.toggle(previewUrl);
                    }}
                  >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                  </Button>
                ) : null}
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0 rounded-full border",
                    selected ? "border-primary bg-primary ring-2 ring-background ring-inset" : "border-input",
                  )}
                />
              </label>
            );
          })}
        </div>
      )}

      {voices.data && total > COLLAPSED_COUNT ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Show fewer voices" : `Show all ${total} voices`}
        </Button>
      ) : null}
    </div>
  );
};
