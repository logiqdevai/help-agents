import type { FC } from "react";
import Link from "next/link";
import { BotIcon } from "lucide-react";
import { AgentMark } from "@/components/ui/agent-mark";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentStatusFormOptions } from "@/config/constants/dropdowns/analytics/agent-status-form.options";
import {
  AgentStatuses,
  type AgentUsage,
  type OutcomeCount,
} from "@/features/analytics/interfaces/analytics.interfaces";
import { formatDuration, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";

const TOP_OUTCOMES = 3;

interface AgentsUsageTableProps {
  agents: AgentUsage[];
  currency: string;
}

const topOutcomeChips = (outcomes: OutcomeCount[], calls: number) =>
  outcomes
    .filter((outcome) => outcome.label)
    .slice(0, TOP_OUTCOMES)
    .map((outcome) => `${outcome.label} ${formatPercent((outcome.count / calls) * 100)}`);

export const AgentsUsageTable: FC<AgentsUsageTableProps> = ({ agents, currency }) => {
  if (agents.length === 0) {
    return (
      <EmptyState
        icon={BotIcon}
        title="No agents yet"
        description="Create an agent and place calls to see how each one performs."
      />
    );
  }

  return (
    <Card className="gap-0 py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11 px-6">Agent</TableHead>
            <TableHead className="text-right">Calls made</TableHead>
            <TableHead className="text-right">Success rate</TableHead>
            <TableHead className="text-right">Avg. duration</TableHead>
            <TableHead className="text-right">Avg. cost</TableHead>
            <TableHead className="px-6">Top outcomes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((row) => {
            const hasCalls = row.calls_made > 0;
            const chips = topOutcomeChips(row.outcomes, row.calls_made);
            return (
              <TableRow key={row.agent.id}>
                <TableCell className="px-6 py-3">
                  <Link href={Routes.agents.detail(row.agent.id)} className="flex items-center gap-3">
                    <AgentMark seed={row.agent.id} />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{row.agent.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {getDropdownOptionLabel(AgentStatusFormOptions, row.agent.status)}
                      </span>
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(row.calls_made)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {hasCalls ? formatPercent(row.success_rate) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {hasCalls ? formatDuration(row.average_duration_seconds) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {hasCalls ? formatMoney(row.average_cost, currency) : "—"}
                </TableCell>
                <TableCell className="px-6">
                  {chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {chips.map((chip) => (
                        <Badge key={chip} variant="secondary">
                          {chip}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {row.agent.status === AgentStatuses.DRAFT ? "Not live yet" : "No calls in this period"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};
