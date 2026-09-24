"use client";

import type { FC } from "react";
import { useState } from "react";
import { LogOutIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Permissions } from "@/config/constants/permissions";
import { CompanyRoles } from "@/features/auth/interfaces/auth.interfaces";
import {
  useGetAgentOptions,
  useGetMembers,
  useLeaveCompany,
  useRemoveMember,
} from "@/features/team/hooks/use-team";
import type { TeamMember } from "@/features/team/interfaces/team.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { useAuthStore } from "@/stores/auth";
import { AgentAccessDialog } from "./components/agent-access-dialog";
import { ChangeRoleDialog } from "./components/change-role-dialog";
import { InvitationsSection } from "./components/invitations-section";
import { InviteMemberDialog } from "./components/invite-member-dialog";
import { MembersTable } from "./components/members-table";
import { RoleExplainer } from "./components/role-explainer";

// The API's largest page — teams are small enough to show every member at once.
const MEMBERS_PAGE_SIZE = 100;

const TeamSettingsPage: FC = () => {
  const { role: myRole, can } = usePermissions();
  const canManageTeam = can(Permissions.TEAM_MANAGE);
  const companyName = useAuthStore((state) => state.companies.find((c) => c.id === state.activeCompanyId)?.name);
  const members = useGetMembers({ limit: MEMBERS_PAGE_SIZE });
  const agents = useGetAgentOptions();
  const removeMember = useRemoveMember();
  const leaveCompany = useLeaveCompany();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null);
  const [accessTarget, setAccessTarget] = useState<TeamMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const owners = members.data?.data.filter((member) => member.role === CompanyRoles.OWNER).length ?? 0;
  const isLastOwner = myRole === CompanyRoles.OWNER && owners <= 1;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3" aria-labelledby="members-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="members-heading" className="font-heading text-lg font-medium">
            Members
            {members.data ? (
              <span className="ml-1.5 text-sm font-normal text-muted-foreground">· {members.data.pagination.total}</span>
            ) : null}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              disabled={isLastOwner}
              title={isLastOwner ? "A company must keep at least one owner. Make someone else an owner first." : undefined}
              onClick={() => setLeaveOpen(true)}
            >
              <LogOutIcon /> Leave company
            </Button>
            {canManageTeam ? (
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlusIcon /> Invite member
              </Button>
            ) : null}
          </div>
        </div>
        {members.isPending ? <TableSkeleton rows={4} columns={5} /> : null}
        {members.isError ? (
          <ErrorState
            title="Could not load team members"
            message={members.error.message}
            onRetry={() => members.refetch()}
          />
        ) : null}
        {members.data ? (
          members.data.data.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No members found" />
          ) : (
            <MembersTable
              members={members.data.data}
              agentCount={agents.data?.length}
              myRole={myRole}
              canManageTeam={canManageTeam}
              onChangeRole={setRoleTarget}
              onEditAccess={setAccessTarget}
              onRemove={setRemoveTarget}
            />
          )
        ) : null}
      </section>

      <InvitationsSection myRole={myRole} canManageTeam={canManageTeam} />
      <RoleExplainer />

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        companyName={companyName ?? "your company"}
        myRole={myRole}
      />
      <ChangeRoleDialog member={roleTarget} onClose={() => setRoleTarget(null)} myRole={myRole} />
      <AgentAccessDialog member={accessTarget} onClose={() => setAccessTarget(null)} />
      <ConfirmationDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove this member?"
        description={`${removeTarget?.user.name ?? removeTarget?.user.email ?? "This person"} will immediately lose access to ${companyName ?? "the company"}.`}
        confirmLabel="Remove"
        isPending={removeMember.isPending}
        onConfirm={() => (removeTarget ? removeMember.mutateAsync(removeTarget.id) : undefined)}
      />
      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title={`Leave ${companyName ?? "this company"}?`}
        description="You will lose access to its agents, calls and data. You would need a new invitation to rejoin."
        confirmLabel="Leave company"
        isPending={leaveCompany.isPending}
        onConfirm={() => leaveCompany.mutateAsync()}
      />
    </div>
  );
};

export default TeamSettingsPage;
