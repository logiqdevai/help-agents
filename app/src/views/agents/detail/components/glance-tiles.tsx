"use client";

import type { FC, ReactNode } from "react";
import Link from "next/link";
import { PauseIcon, PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationStatuses } from "@/features/integrations/interfaces/integrations.interfaces";
import type { Agent, AgentOverview } from "@/features/agents/interfaces/agents.interfaces";
import { useGetVoices } from "@/features/voices/hooks/use-voices";
import { formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAudioPreview } from "@/views/agents/hooks/use-audio-preview";
import { describeVoice } from "@/views/agents/utils/voice-format";
import { IntegrationStatusBadge } from "@/views/integrations/components/integration-status-badge";

interface TileProps {
  label: string;
  className?: string;
  children: ReactNode;
}

const Tile: FC<TileProps> = ({ label, className, children }) => (
  <Card className={cn("min-w-0 gap-1.5 px-6 py-5", className)}>
    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
    {children}
  </Card>
);

const VoiceTile: FC<{ voiceId: string | null }> = ({ voiceId }) => {
  const voices = useGetVoices();
  const preview = useAudioPreview();
  const voice = voices.data?.find((candidate) => candidate.voice_id === voiceId);
  const previewUrl = voice?.preview_audio_url ?? null;
  const isPlaying = !!previewUrl && preview.playingUrl === previewUrl;

  if (voiceId && voices.isPending) return <Skeleton className="h-6 w-40" />;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="truncate font-medium">
        {voice ? [voice.name, describeVoice(voice)].filter(Boolean).join(" · ") : voiceId ? "Custom voice" : "Default voice"}
      </p>
      {previewUrl ? (
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={isPlaying ? "Stop the voice sample" : "Play the voice sample"}
          onClick={() => preview.toggle(previewUrl)}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>
      ) : null}
    </div>
  );
};

interface GlanceTilesProps {
  agent: Agent;
  overview: AgentOverview;
}

/** What spec §36 wants on one screen: goal, voice, knowledge, CRM, phone and performance. */
export const GlanceTiles: FC<GlanceTilesProps> = ({ agent, overview }) => {
  const numbers = overview.phone_numbers;
  const knowledgeCount = overview.knowledge_sources_count;
  const crm = overview.crm_integration;

  return (
    <section aria-label="Agent at a glance" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="Goal" className="sm:col-span-2">
        <p className="font-medium">{overview.goal || "No goal written yet"}</p>
        {agent.purpose ? <p className="text-sm text-muted-foreground">{agent.purpose}</p> : null}
      </Tile>
      <Tile label="Voice" className="sm:col-span-2">
        <VoiceTile voiceId={overview.voice} />
      </Tile>
      <Tile label="Knowledge">
        <p className="font-medium">
          {knowledgeCount === 0 ? "None" : `${knowledgeCount} ${knowledgeCount === 1 ? "source" : "sources"}`}
        </p>
        <p className="text-sm text-muted-foreground">
          <Link href={Routes.knowledge.root} className="underline underline-offset-4">
            Open Knowledge
          </Link>
          {knowledgeCount > 0 ? " · used live in calls" : ""}
        </p>
      </Tile>
      <Tile label="CRM">
        <p className="truncate font-medium">{crm ? crm.name : "None"}</p>
        <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
          {crm ? (
            <>
              <IntegrationStatusBadge status={crm.status} />
              {crm.status === IntegrationStatuses.ACTIVE ? `${agent.crm_tools.length} actions allowed` : null}
            </>
          ) : (
            "The agent does not read or write records."
          )}
        </div>
      </Tile>
      <Tile label="Phone">
        {numbers.length ? (
          <p className="font-medium tabular-nums">{numbers.map((phone) => phone.number).join(", ")}</p>
        ) : (
          <p className="font-medium text-muted-foreground">No number yet</p>
        )}
        <p className="text-sm text-muted-foreground">
          <Link href={Routes.phoneNumbers} className="underline underline-offset-4">
            Phone numbers
          </Link>
        </p>
      </Tile>
      <Tile label="Performance">
        <div className="flex gap-6">
          <div>
            <p className="font-display text-3xl leading-tight font-light tabular-nums">
              {formatNumber(overview.calls_made)}
            </p>
            <p className="text-xs text-muted-foreground">Calls made</p>
          </div>
          <div>
            <p className="font-display text-3xl leading-tight font-light tabular-nums">
              {formatPercent(overview.success_rate)}
            </p>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </div>
        </div>
      </Tile>
    </section>
  );
};
