"use client";

import { useState, type FC } from "react";
import { PlusIcon, ZapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Permissions } from "@/config/constants/permissions";
import type { Agent } from "@/features/agents/interfaces/agents.interfaces";
import { useGetAutomationRules } from "@/features/automation-rules/hooks/use-automation-rules";
import type { AutomationRule } from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { AutomationRuleCard } from "./automation-rule-card";
import { AutomationRuleDialog } from "./automation-rule-dialog";

const RULES_LIMIT = 100;

export const AutomationsTab: FC<{ agent: Agent }> = ({ agent }) => {
  const { can } = usePermissions();
  const canRead = can(Permissions.AUTOMATION_READ);
  const canManage = can(Permissions.AUTOMATION_MANAGE);
  const rules = useGetAutomationRules(
    { agent_uuid: agent.id, include_company_wide: true, limit: RULES_LIMIT },
    canRead,
  );
  // `undefined` = dialog closed, `null` = creating a new rule, otherwise editing that rule.
  const [editing, setEditing] = useState<AutomationRule | null | undefined>(undefined);

  if (!canRead) {
    return <p className="text-sm text-muted-foreground">You do not have access to automation rules.</p>;
  }

  const renderRules = () => {
    if (rules.isPending) {
      return (
        <div className="flex flex-col gap-4" aria-busy="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (rules.isError) {
      return (
        <ErrorState title="Could not load the rules" message={rules.error.message} onRetry={() => rules.refetch()} />
      );
    }
    if (rules.data.data.length === 0) {
      return (
        <EmptyState
          icon={ZapIcon}
          title="No automations yet"
          description="Automations do something after a call: update your CRM, book a follow-up, send a message. Add a rule to get started."
          action={
            canManage ? (
              <Button onClick={() => setEditing(null)}>
                <PlusIcon aria-hidden="true" />
                Add rule
              </Button>
            ) : undefined
          }
        />
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {rules.data.data.map((rule) => (
          <AutomationRuleCard
            key={rule.id}
            rule={rule}
            agent={agent}
            canManage={canManage}
            onEdit={() => setEditing(rule)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          &ldquo;When this happens, do that.&rdquo; Rules here apply to this agent only. Rules that apply to every agent
          in your company are marked <Badge variant="outline">All agents</Badge>. Rules are saved as soon as you
          confirm them.
        </p>
        {canManage && rules.data && rules.data.data.length > 0 ? (
          <Button variant="outline" onClick={() => setEditing(null)}>
            <PlusIcon aria-hidden="true" />
            Add rule
          </Button>
        ) : null}
      </div>

      {renderRules()}

      {editing !== undefined ? (
        <AutomationRuleDialog agent={agent} rule={editing} onClose={() => setEditing(undefined)} />
      ) : null}
    </div>
  );
};
