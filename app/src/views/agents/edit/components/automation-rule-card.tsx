"use client";

import { useState, type FC } from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { AutomationTriggerSummaryOptions } from "@/config/constants/dropdowns/agents/automation-trigger-summary.options";
import { useDeleteAutomationRule, useSetAutomationRuleEnabled } from "@/features/automation-rules/hooks/use-automation-rules";
import { AutomationTriggers, type AutomationRule } from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { AutomationActionIcons } from "../utils/automation-action-icons";
import { summarizeAction } from "../utils/automation-summary";

const Chip: FC<{ strong?: boolean; children: string }> = ({ strong, children }) => (
  <span
    className={cn(
      "rounded-full border border-border bg-card px-3 py-1 text-sm",
      strong && "border-foreground/20 bg-secondary font-medium",
    )}
  >
    {children}
  </span>
);

interface AutomationRuleCardProps {
  rule: AutomationRule;
  agent: Agent;
  canManage: boolean;
  onEdit: () => void;
}

/** "When this happens, then do that": one rule with its actions and an on/off switch. */
export const AutomationRuleCard: FC<AutomationRuleCardProps> = ({ rule, agent, canManage, onEdit }) => {
  const setEnabled = useSetAutomationRuleEnabled();
  const deleteRule = useDeleteAutomationRule();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const outcomeLabel =
    rule.trigger === AutomationTriggers.CALL_OUTCOME
      ? (agent.outcomes.find((outcome) => outcome.id === rule.outcome_uuid)?.label ?? "Any outcome")
      : null;

  return (
    <Card className={cn("gap-0 py-0", !rule.is_enabled && "opacity-70")}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">When</span>
          <Chip>{getDropdownOptionLabel(AutomationTriggerSummaryOptions, rule.trigger)}</Chip>
          {outcomeLabel ? <Chip strong>{outcomeLabel}</Chip> : null}
          {rule.agent_uuid === null ? <Badge variant="outline">All agents</Badge> : null}
        </div>
        <div className="flex items-center gap-1.5">
          {canManage ? (
            <>
              <Button variant="ghost" size="icon" aria-label={`Edit ${rule.name}`} onClick={onEdit}>
                <PencilIcon aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${rule.name}`} onClick={() => setDeleteOpen(true)}>
                <Trash2Icon aria-hidden="true" />
              </Button>
            </>
          ) : null}
          {setEnabled.isPending ? (
            <Spinner className="size-5" />
          ) : (
            <Switch
              checked={rule.is_enabled}
              disabled={!canManage}
              aria-label={`Run "${rule.name}"`}
              onCheckedChange={(next) => setEnabled.mutate({ id: rule.id, isEnabled: next })}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 px-5 py-4">
        <p className="text-sm font-medium">{rule.name}</p>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Then</span>
          <ul className="flex flex-col gap-2">
            {rule.actions.map((action) => {
              const summary = summarizeAction(action);
              const Icon = AutomationActionIcons[action.type];
              return (
                <li
                  key={action.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-muted/60 px-3 py-2 text-sm"
                >
                  <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    {summary.label}
                    {summary.detail ? <span className="text-muted-foreground"> · {summary.detail}</span> : null}
                  </span>
                  <span className="text-xs text-muted-foreground">{summary.when}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this rule?"
        description={`"${rule.name}" stops running for future calls. Actions it already started are not affected.`}
        confirmLabel="Delete rule"
        isPending={deleteRule.isPending}
        onConfirm={() => deleteRule.mutateAsync(rule.id)}
      />
    </Card>
  );
};
