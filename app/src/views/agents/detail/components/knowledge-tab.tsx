"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpenIcon, InfoIcon, PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KnowledgeSourceTypeOptions } from "@/config/constants/dropdowns/knowledge/knowledge-source-type.options";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";
import { KnowledgeStatusBadge } from "@/views/knowledge/components/knowledge-status-badge";
import { SourceTypeIcon } from "@/views/knowledge/components/source-type-icon";

export const KnowledgeTab: FC<{ agent: Agent; canEdit: boolean }> = ({ agent, canEdit }) => {
  const router = useRouter();
  const sources = agent.knowledge_sources;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Sources this agent can search live while it talks to customers.
        </p>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <Link href={Routes.knowledge.create} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <PlusIcon aria-hidden="true" />
              Add knowledge
            </Link>
            <Link href={Routes.agents.edit(agent.id, "knowledge")} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Choose sources
            </Link>
          </div>
        ) : null}
      </div>

      {sources.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title="No knowledge attached"
          description="Attach pricing, policies and FAQs so the agent can answer questions correctly."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow
                  key={source.id}
                  className="cursor-pointer"
                  onClick={() => router.push(Routes.knowledge.detail(source.id))}
                >
                  <TableCell>
                    <span className="flex items-center gap-3">
                      <SourceTypeIcon type={source.type} />
                      <Link
                        href={Routes.knowledge.detail(source.id)}
                        className="font-medium hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {source.name}
                      </Link>
                    </span>
                  </TableCell>
                  <TableCell>{getDropdownOptionLabel(KnowledgeSourceTypeOptions, source.type)}</TableCell>
                  <TableCell>
                    <KnowledgeStatusBadge status={source.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p>
          Each call keeps a snapshot of the knowledge the agent had at the time, so you can always see what it knew
          during a past call.
        </p>
      </div>
    </div>
  );
};
