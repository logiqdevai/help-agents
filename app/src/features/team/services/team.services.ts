import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import { cleanParams, type MessageResponse, type PaginatedResponse } from "@/interfaces/common.interfaces";
import type {
  AgentOption,
  CreateInvitationDto,
  InvitationDelivery,
  InvitationsQuery,
  MemberAgentAccess,
  MembersQuery,
  SetAgentAccessDto,
  TeamInvitation,
  TeamMember,
  UpdatedMember,
  UpdateMemberDto,
} from "@/features/team/interfaces/team.interfaces";

// The largest page the API serves — teams and agent lists are small enough to load in one request.
const MAX_PAGE_SIZE = 100;

export const getMembers = async (query?: MembersQuery): Promise<PaginatedResponse<TeamMember>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.members, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load team members."));
  }
};

export const updateMember = async ({ id, ...dto }: UpdateMemberDto & { id: string }): Promise<UpdatedMember> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.company.member(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update this member."));
  }
};

export const removeMember = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.company.member(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not remove this member."));
  }
};

export const leaveCompany = async (): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.company.leave);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not leave the company."));
  }
};

export const getMemberAgentAccess = async (id: string): Promise<MemberAgentAccess> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.memberAgentAccess(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load this member's agent access."));
  }
};

export const setMemberAgentAccess = async ({
  id,
  ...dto
}: SetAgentAccessDto & { id: string }): Promise<MemberAgentAccess> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.company.memberAgentAccess(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save agent access."));
  }
};

export const getInvitations = async (query?: InvitationsQuery): Promise<PaginatedResponse<TeamInvitation>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.invitations, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load invitations."));
  }
};

export const createInvitation = async (dto: CreateInvitationDto): Promise<InvitationDelivery> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.company.invitations, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not send the invitation."));
  }
};

export const resendInvitation = async (id: string): Promise<InvitationDelivery> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.company.resendInvitation(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not resend the invitation."));
  }
};

export const revokeInvitation = async (id: string): Promise<MessageResponse> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.company.invitation(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not revoke the invitation."));
  }
};

/** Agents of the company as id + name + status, used for per-member access pickers. */
export const getAgentOptions = async (): Promise<AgentOption[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.agents.root, { params: { limit: MAX_PAGE_SIZE } });
    return (response.data.data as AgentOption[]).map(({ id, name, status }) => ({ id, name, status }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load agents."));
  }
};
