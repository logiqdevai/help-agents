"use client";

import type { FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVoices } from "@/features/voices/hooks/use-voices";
import { describeVoice } from "../utils/voice-format";

interface AgentVoiceTextProps {
  /** The agent's voice id; null when the platform picks a default. */
  voiceId: string | null;
  /** Show the gender and accent after the name. */
  detailed?: boolean;
}

/** Looks up an agent's voice by id and shows its name (and optionally what it sounds like). */
export const AgentVoiceText: FC<AgentVoiceTextProps> = ({ voiceId, detailed = false }) => {
  const voices = useGetVoices();

  if (!voiceId) return <>Default voice</>;
  if (voices.isPending) return <Skeleton className="inline-block h-4 w-24 align-middle" />;

  const voice = voices.data?.find((candidate) => candidate.voice_id === voiceId);
  if (!voice) return <>Custom voice</>;

  const description = detailed ? describeVoice(voice) : "";
  return <>{description ? `${voice.name} · ${description}` : voice.name}</>;
};
