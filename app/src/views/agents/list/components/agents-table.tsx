"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TriangleAlertIcon } from "lucide-react";
import { AgentMark } from "@/components/ui/agent-mark";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AgentListItem } from "@/features/agents/interfaces/agents.interfaces";
import { IntegrationStatuses } from "@/features/integrations/interfaces/integrations.interfaces";
import { formatNumber, formatPercent, formatRelative } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { AgentStatusBadge } from "@/views/agents/components/agent-status-badge";
import { AgentVoiceText } from "@/views/agents/components/agent-voice-text";

const Muted: FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-muted-foreground">{children}</span>
);

export const AgentsTable: FC<{ agents: AgentListItem[] }> = ({ agents }) => {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Voice</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>CRM</TableHead>
            <TableHead className="text-right">Knowledge</TableHead>
            <TableHead className="text-right">Calls</TableHead>
            <TableHead className="text-right">Success</TableHead>
            <TableHead>Last call</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => (
            <TableRow
              key={agent.id}
              className="cursor-pointer"
              onClick={() => router.push(Routes.agents.detail(agent.id))}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <AgentMark seed={agent.id} />
                  <div className="min-w-0">
                    <Link
                      href={Routes.agents.detail(agent.id)}
                      className="font-medium hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {agent.name}
                    </Link>
                    {agent.purpose ? (
                      <span className="block max-w-64 truncate text-xs text-muted-foreground">{agent.purpose}</span>
                    ) : null}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <AgentStatusBadge status={agent.status} />
              </TableCell>
              <TableCell>
                <AgentVoiceText voiceId={agent.voice} />
              </TableCell>
              <TableCell className="tabular-nums">
                {agent.phone_numbers.length ? agent.phone_numbers.map((phone) => phone.number).join(", ") : <Muted>—</Muted>}
              </TableCell>
              <TableCell>
                {agent.crm_integration ? (
                  agent.crm_integration.status === IntegrationStatuses.ERROR ? (
                    <span className="flex items-center gap-1.5 text-destructive">
                      <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
                      {agent.crm_integration.name}
                      <span className="sr-only">(connection failing)</span>
                    </span>
                  ) : (
                    agent.crm_integration.name
                  )
                ) : (
                  <Muted>—</Muted>
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(agent.knowledge_sources_count)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(agent.calls_made)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {agent.success_rate === null ? <Muted>—</Muted> : formatPercent(agent.success_rate)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {agent.last_call_at ? formatRelative(agent.last_call_at) : <Muted>—</Muted>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
