import type { FC } from "react";
import Link from "next/link";
import { AudioLinesIcon, DatabaseIcon, PhoneIcon, TriangleAlertIcon } from "lucide-react";
import { AgentMark } from "@/components/ui/agent-mark";
import { Card } from "@/components/ui/card";
import type { AgentListItem } from "@/features/agents/interfaces/agents.interfaces";
import { IntegrationStatuses } from "@/features/integrations/interfaces/integrations.interfaces";
import { formatNumber, formatPercent, formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { AgentStatusBadge } from "@/views/agents/components/agent-status-badge";
import { AgentVoiceText } from "@/views/agents/components/agent-voice-text";

const Stat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <p className="truncate font-display text-2xl leading-tight font-light tabular-nums">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export const AgentCard: FC<{ agent: AgentListItem }> = ({ agent }) => {
  const crmFailing = agent.crm_integration?.status === IntegrationStatuses.ERROR;
  const numbers = agent.phone_numbers.map((phone) => phone.number).join(", ");

  return (
    <Card className="group/agent relative gap-0 py-0 transition-shadow focus-within:ring-2 focus-within:ring-ring/50 hover:shadow-sm">
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-start gap-3">
          <AgentMark seed={agent.id} className="size-11 [&>svg]:size-5" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-medium">
              <Link
                href={Routes.agents.detail(agent.id)}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {agent.name}
              </Link>
            </h3>
            <div className="mt-1">
              <AgentStatusBadge status={agent.status} />
            </div>
          </div>
        </div>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {agent.description || agent.purpose || "No description yet."}
        </p>
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2.5">
            <PhoneIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            {numbers ? (
              <span className="truncate tabular-nums">{numbers}</span>
            ) : (
              <span className="text-muted-foreground">No phone number yet</span>
            )}
          </li>
          <li className="flex items-center gap-2.5">
            <AudioLinesIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">
              <AgentVoiceText voiceId={agent.voice} detailed />
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <DatabaseIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="truncate">
              {agent.crm_integration ? agent.crm_integration.name : <span className="text-muted-foreground">No CRM</span>}
              {" · "}
              {agent.knowledge_sources_count === 0
                ? "no knowledge"
                : `${agent.knowledge_sources_count} knowledge ${agent.knowledge_sources_count === 1 ? "source" : "sources"}`}
            </span>
          </li>
          {crmFailing ? (
            <li className="flex items-center gap-2.5 text-destructive">
              <TriangleAlertIcon className="size-4 shrink-0" aria-hidden="true" />
              CRM connection failing
            </li>
          ) : null}
        </ul>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-border px-6 py-4">
        <Stat label="Calls made" value={formatNumber(agent.calls_made)} />
        <Stat label="Success rate" value={formatPercent(agent.success_rate)} />
        <Stat label="Last call" value={agent.last_call_at ? formatRelative(agent.last_call_at) : "—"} />
      </div>
    </Card>
  );
};
