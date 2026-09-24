import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import type { PaginationQuery } from "@/interfaces/common.interfaces";

export const InvitationStatuses = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REVOKED: "revoked",
  EXPIRED: "expired",
} as const;
export type InvitationStatus = (typeof InvitationStatuses)[keyof typeof InvitationStatuses];

export interface TeamMember {
  id: string;
  role: CompanyRole;
  permissions: string[];
  is_self: boolean;
  agent_access_count: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    email_verified: boolean;
    last_login_at: string | null;
  };
  created_at: string;
}

export interface MembersQuery extends PaginationQuery {
  search?: string;
  role?: CompanyRole;
}

export interface UpdateMemberDto {
  role?: CompanyRole;
  permissions?: string[];
}

export interface UpdatedMember {
  id: string;
  role: CompanyRole;
  permissions: string[];
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: CompanyRole;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  invited_by: { id: string; name: string | null; email: string } | null;
}

export interface InvitationsQuery extends PaginationQuery {
  status?: InvitationStatus | "all";
}

export interface CreateInvitationDto {
  email: string;
  role: CompanyRole;
}

/** Response of create / resend: the invitation plus whether the email could be delivered. */
export interface InvitationDelivery extends Omit<TeamInvitation, "invited_by"> {
  email_sent: boolean;
}

export interface AgentOption {
  id: string;
  name: string;
  status: string;
}

export interface MemberAgentAccess {
  member_uuid: string;
  /** Owners, admins and viewers see every agent; only members are limited to granted agents. */
  unrestricted: boolean;
  agents: AgentOption[];
}

export interface SetAgentAccessDto {
  agent_uuids: string[];
}
