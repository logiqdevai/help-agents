"use client";

import { useId, useState, type FC } from "react";
import Link from "next/link";
import { UsersIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getCompanyRoleLabel } from "@/config/constants/dropdowns/users/company-role-form.options";
import { Permissions } from "@/config/constants/permissions";
import { useGetAgentAccess, useReplaceAgentAccess } from "@/features/agents/hooks/use-agents";
import type { Agent, AgentAccessMember } from "@/features/agents/interfaces/agents.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { initialsOf } from "@/lib/format";
import { Routes } from "@/routes/routes";
import { useReportDirty } from "../hooks/use-unsaved-changes";
import { EditSections, type SetSectionDirty } from "../types";
import { EditSaveBar } from "./edit-save-bar";

interface MemberRowProps {
  member: AgentAccessMember;
  checked: boolean;
  canManage: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const MemberRow: FC<MemberRowProps> = ({ member, checked, canManage, onCheckedChange }) => {
  const labelId = useId();
  const name = member.user.name ?? member.user.email;

  return (
    <li className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0">
      <Avatar className="size-9">
        <AvatarFallback>{initialsOf(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p id={labelId} className="truncate text-sm font-medium">
          {name}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {getCompanyRoleLabel(member.role)}
          {member.unrestricted ? " · sees every agent" : ` · ${member.user.email}`}
        </p>
      </div>
      {member.unrestricted ? (
        <Badge variant="outline">Always</Badge>
      ) : (
        <span className="flex items-center gap-2 text-sm">
          <span aria-hidden="true">Has access</span>
          <Switch
            checked={checked}
            disabled={!canManage}
            onCheckedChange={onCheckedChange}
            aria-labelledby={labelId}
          />
        </span>
      )}
    </li>
  );
};

/** Which members can use this agent; owners, admins and viewers always can. */
export const AccessTab: FC<{ agent: Agent; setSectionDirty: SetSectionDirty }> = ({ agent, setSectionDirty }) => {
  const { can } = usePermissions();
  const canRead = can(Permissions.TEAM_READ);
  const canManage = can(Permissions.TEAM_MANAGE);
  const access = useGetAgentAccess(agent.id, canRead);
  const replaceAccess = useReplaceAgentAccess();
  // Undefined until a switch is changed; until then the saved grants from the API are shown.
  const [edited, setEdited] = useState<string[] | undefined>(undefined);

  const members = access.data?.members ?? [];
  const savedIds = members.filter((member) => !member.unrestricted && member.has_access).map((m) => m.member_uuid);
  const grantedIds = edited ?? savedIds;
  const isDirty =
    edited !== undefined && (edited.length !== savedIds.length || edited.some((id) => !savedIds.includes(id)));
  useReportDirty(EditSections.ACCESS, isDirty, setSectionDirty);

  const toggle = (memberId: string, checked: boolean) =>
    setEdited(checked ? [...grantedIds, memberId] : grantedIds.filter((id) => id !== memberId));

  const renderBody = () => {
    if (!canRead) {
      return <p className="text-sm text-muted-foreground">You do not have access to your team&apos;s permissions.</p>;
    }
    if (access.isPending) {
      return (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      );
    }
    if (access.isError) {
      return (
        <ErrorState title="Could not load who can use this agent" message={access.error.message} onRetry={() => access.refetch()} />
      );
    }
    if (members.length === 0) {
      return (
        <EmptyState
          icon={UsersIcon}
          title="No team members yet"
          description="Invite your team, then choose which agents they can use."
        />
      );
    }
    return (
      <ul>
        {members.map((member) => (
          <MemberRow
            key={member.member_uuid}
            member={member}
            checked={grantedIds.includes(member.member_uuid)}
            canManage={canManage}
            onCheckedChange={(checked) => toggle(member.member_uuid, checked)}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Who can use this agent"
        description="Owners, admins and viewers can always see every agent. Members only see the agents they have been given."
        actions={
          can(Permissions.TEAM_READ) ? (
            <Link href={Routes.settings.team} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Manage team
            </Link>
          ) : undefined
        }
      >
        {renderBody()}
      </SectionCard>
      <EditSaveBar
        isDirty={isDirty}
        isPending={replaceAccess.isPending}
        isLive={false}
        onSave={() =>
          replaceAccess.mutate({ id: agent.id, memberIds: grantedIds }, { onSuccess: () => setEdited(undefined) })
        }
        onDiscard={() => setEdited(undefined)}
      />
    </div>
  );
};
