"use client";

import type { FC } from "react";
import { BotIcon, EllipsisIcon, ShieldCheckIcon, UserMinusIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import type { TeamMember } from "@/features/team/interfaces/team.interfaces";
import { canManageRole } from "@/features/team/utils/team-policy.utils";
import { formatRelative, initialsOf } from "@/lib/format";
import { RoleBadge } from "./role-badge";

interface MembersTableProps {
  members: TeamMember[];
  /** Number of agents in the company, or undefined while unknown. */
  agentCount: number | undefined;
  myRole: CompanyRole | undefined;
  canManageTeam: boolean;
  onChangeRole: (member: TeamMember) => void;
  onEditAccess: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

const AgentAccessCell: FC<{ member: TeamMember; agentCount: number | undefined }> = ({ member, agentCount }) => {
  if (member.role === CompanyRoles.MEMBER) {
    const granted = member.agent_access_count;
    if (granted === 0) return <span className="text-muted-foreground">No agents assigned</span>;
    const total = agentCount ?? granted;
    return (
      <span className="font-medium">
        Access to {granted}
        {agentCount === undefined ? "" : ` of ${agentCount}`} {total === 1 ? "agent" : "agents"}
      </span>
    );
  }
  return (
    <span>
      All agents
      {member.role === CompanyRoles.VIEWER ? <span className="text-muted-foreground"> · read-only</span> : null}
    </span>
  );
};

export const MembersTable: FC<MembersTableProps> = ({
  members,
  agentCount,
  myRole,
  canManageTeam,
  onChangeRole,
  onEditAccess,
  onRemove,
}) => (
  <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Agent access</TableHead>
          <TableHead>Last active</TableHead>
          {canManageTeam ? (
            <TableHead className="pr-4 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => {
          const name = member.user.name ?? member.user.email;
          const manageable = canManageTeam && !member.is_self && canManageRole(myRole, member.role);
          return (
            <TableRow key={member.id}>
              <TableCell className="pl-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-lavender/60 text-xs font-medium">
                      {initialsOf(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{name}</span>
                      {member.is_self ? <Badge variant="secondary">You</Badge> : null}
                    </p>
                    <p className="truncate text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <RoleBadge role={member.role} />
              </TableCell>
              <TableCell>
                <AgentAccessCell member={member} agentCount={agentCount} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {member.is_self ? "Now" : member.user.last_login_at ? formatRelative(member.user.last_login_at) : "Never"}
              </TableCell>
              {canManageTeam ? (
                <TableCell className="pr-4 text-right">
                  {manageable ? (
                    <div className="flex items-center justify-end gap-1">
                      {member.role === CompanyRoles.MEMBER ? (
                        <Button variant="outline" size="sm" onClick={() => onEditAccess(member)}>
                          Edit access
                        </Button>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name}`} />}
                        >
                          <EllipsisIcon />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-48">
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onChangeRole(member)}>
                              <ShieldCheckIcon /> Change role
                            </DropdownMenuItem>
                            {member.role === CompanyRoles.MEMBER ? (
                              <DropdownMenuItem onClick={() => onEditAccess(member)}>
                                <BotIcon /> Edit agent access
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onRemove(member)}>
                            <UserMinusIcon /> Remove from company
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Cannot be changed</span>
                  )}
                </TableCell>
              ) : null}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);
