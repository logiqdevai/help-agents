"use client";

import type { FC, ReactNode } from "react";
import Link from "next/link";
import { CircleCheckIcon, CircleIcon, PencilIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AutomationActionTypeFormOptions } from "@/config/constants/dropdowns/agents/automation-action-type-form.options";
import { GoalDataTypeFormOptions } from "@/config/constants/dropdowns/agents/goal-data-type-form.options";
import { GoalRequirementFormOptions } from "@/config/constants/dropdowns/agents/goal-requirement-form.options";
import { Permissions } from "@/config/constants/permissions";
import {
  GoalDataTypes,
  type Agent,
  type AgentGoalItem,
  type AgentOutcome,
} from "@/features/agents/interfaces/agents.interfaces";
import { useGetAutomationRules } from "@/features/automation-rules/hooks/use-automation-rules";
import {
  AutomationTriggers,
  type AutomationRule,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const RULES_LIMIT = 100;
const SECONDS_PER_MINUTE = 60;

const Quote: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-border bg-muted/50 px-4 py-3.5 text-sm leading-relaxed whitespace-pre-line">
    {children}
  </div>
);

const Flag: FC<{ on: boolean; children: ReactNode }> = ({ on, children }) => {
  const Icon = on ? CircleCheckIcon : CircleIcon;
  return (
    <li className={cn("flex items-center gap-2.5", !on && "text-muted-foreground")}>
      <Icon className={cn("size-4 shrink-0", on && "text-semantic-success")} aria-hidden="true" />
      {children}
    </li>
  );
};

const describeAnswer = (item: AgentGoalItem): string =>
  item.data_type === GoalDataTypes.ENUM && item.enum_values.length
    ? item.enum_values.join(" / ")
    : getDropdownOptionLabel(GoalDataTypeFormOptions, item.data_type);

const GoalList: FC<{ items: AgentGoalItem[] }> = ({ items }) =>
  items.length === 0 ? (
    <p className="text-sm text-muted-foreground">Nothing listed.</p>
  ) : (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-2.5 py-2 text-sm">
          <CircleIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            {item.label}
            <span className="block text-xs text-muted-foreground">{describeAnswer(item)}</span>
          </span>
        </li>
      ))}
    </ul>
  );

/** What an outcome sets in motion: the actions of the enabled rules that fire on it. */
function describeFollowUp(outcome: AgentOutcome, rules: AutomationRule[]): string {
  const types = new Set(
    rules
      .filter(
        (rule) =>
          rule.is_enabled && rule.trigger === AutomationTriggers.CALL_OUTCOME && rule.outcome_uuid === outcome.id,
      )
      .flatMap((rule) => rule.actions.map((action) => action.type)),
  );
  return [...types].map((type) => getDropdownOptionLabel(AutomationActionTypeFormOptions, type)).join(" · ");
}

const OutcomesTable: FC<{ agent: Agent }> = ({ agent }) => {
  const { can } = usePermissions();
  const canReadRules = can(Permissions.AUTOMATION_READ);
  const rules = useGetAutomationRules({ agent_uuid: agent.id, limit: RULES_LIMIT }, canReadRules);

  return (
    <SectionCard
      title="Possible outcomes"
      description="Each outcome can trigger follow-up actions."
      flush
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Outcome</TableHead>
            <TableHead>Counts as</TableHead>
            <TableHead>Detected</TableHead>
            <TableHead>Then</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agent.outcomes.map((outcome) => {
            const followUp = rules.data ? describeFollowUp(outcome, rules.data.data) : "";
            return (
              <TableRow key={outcome.id}>
                <TableCell className="font-medium">{outcome.label}</TableCell>
                <TableCell>
                  <StatusBadge tone={outcome.is_success ? StatusTones.SUCCESS : StatusTones.NEUTRAL}>
                    {outcome.is_success ? "Success" : "Other"}
                  </StatusBadge>
                </TableCell>
                <TableCell>{outcome.system_type ? "Automatically" : "By the agent"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {followUp || (!canReadRules ? "" : rules.isPending ? "…" : "—")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </SectionCard>
  );
};

export const BehaviorTab: FC<{ agent: Agent; canEdit: boolean }> = ({ agent, canEdit }) => {
  const groups = GoalRequirementFormOptions.map((option) => ({
    ...option,
    items: agent.goal_items.filter((item) => item.requirement === option.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">A read-only summary of how this agent behaves on a call.</p>
        {canEdit ? (
          <Link href={Routes.agents.edit(agent.id, "instructions")} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <PencilIcon aria-hidden="true" />
            Edit behavior
          </Link>
        ) : null}
      </div>

      <SectionCard
        title="Instructions"
        actions={
          <span className="text-sm text-muted-foreground">
            Plain language · {formatNumber(agent.instructions.length)} characters
          </span>
        }
      >
        {agent.instructions.trim() ? (
          <div className="max-h-96 overflow-y-auto">
            <Quote>{agent.instructions}</Quote>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No instructions written yet.</p>
        )}
      </SectionCard>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SectionCard title="Goal" description={agent.goal ?? undefined}>
          <div className="flex flex-col gap-4">
            {groups.map((group, index) => (
              <div key={group.id} className={cn(index > 0 && "border-t border-border pt-4")}>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>
                <GoalList items={group.items} />
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex flex-col gap-6">
          <SectionCard title="Questions" description="Worked into the conversation, not a script.">
            {agent.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions.</p>
            ) : (
              <ol className="flex flex-col">
                {agent.questions.map((question, index) => (
                  <li key={question.id} className="flex gap-3 border-b border-border py-3 last:border-b-0">
                    <span
                      aria-hidden="true"
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-muted-foreground">
                        {question.is_required ? "Must be answered" : "Optional"}
                        {question.expected_answer ? ` · hoped-for answer: ${question.expected_answer}` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </SectionCard>
          <SectionCard title="Success">
            <div className="flex flex-col gap-2 text-sm">
              <p>
                <span className="font-medium">Successful:</span>{" "}
                {agent.success_criteria || <span className="text-muted-foreground">Not described</span>}
              </p>
              <p>
                <span className="font-medium">Unsuccessful:</span>{" "}
                {agent.failure_criteria || <span className="text-muted-foreground">Not described</span>}
              </p>
              <p className="text-muted-foreground">
                Maximum call length:{" "}
                {agent.max_call_duration_seconds
                  ? `${Math.round(agent.max_call_duration_seconds / SECONDS_PER_MINUTE)} minutes`
                  : "platform default"}
              </p>
            </div>
          </SectionCard>
        </div>
      </div>

      <OutcomesTable agent={agent} />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SectionCard
          title="Talking to a human"
          actions={
            <StatusBadge tone={agent.transfer_enabled ? StatusTones.SUCCESS : StatusTones.NEUTRAL}>
              {agent.transfer_enabled ? "On" : "Off"}
            </StatusBadge>
          }
        >
          {agent.transfer_enabled ? (
            <div className="flex flex-col gap-4 text-sm">
              <ul className="flex flex-col gap-2.5">
                <Flag on={agent.transfer_on_request}>Transfer when the customer asks for a human</Flag>
                <Flag on={agent.transfer_on_unresolved}>Transfer when the agent can&apos;t resolve the conversation</Flag>
                <Flag on={agent.outcomes.some((outcome) => outcome.triggers_transfer)}>
                  Transfer when a specific outcome is reached
                  {agent.outcomes.some((outcome) => outcome.triggers_transfer)
                    ? `: ${agent.outcomes
                        .filter((outcome) => outcome.triggers_transfer)
                        .map((outcome) => outcome.label)
                        .join(", ")}`
                    : ""}
                </Flag>
              </ul>
              <dl className="grid gap-x-4 gap-y-2 sm:grid-cols-[8rem_minmax(0,1fr)]">
                <dt className="text-muted-foreground">Transfer to</dt>
                <dd className="tabular-nums">{agent.transfer_number ?? "No number set"}</dd>
                {agent.transfer_fallback_message ? (
                  <>
                    <dt className="text-muted-foreground">If nobody answers</dt>
                    <dd>&ldquo;{agent.transfer_fallback_message}&rdquo;</dd>
                  </>
                ) : null}
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The agent never hands a call to a person.</p>
          )}
        </SectionCard>

        <SectionCard title="Voicemail">
          <div className="flex flex-col gap-4 text-sm">
            <ul className="flex flex-col gap-2.5">
              <Flag on={agent.detect_voicemail}>Detect voicemail and log it as its own outcome</Flag>
              <Flag on={agent.leave_voicemail}>Leave a short pre-approved message</Flag>
            </ul>
            {agent.leave_voicemail && agent.voicemail_message ? (
              <Quote>&ldquo;{agent.voicemail_message}&rdquo;</Quote>
            ) : null}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
