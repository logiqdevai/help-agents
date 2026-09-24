import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  AcceptInvitationResult,
  InvitationPreview,
} from "@/features/invitations/interfaces/invitations.interfaces";

export const getInvitationPreview = async (token: string): Promise<InvitationPreview> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.invitations.preview, { params: { token } });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "This invitation is invalid or has expired."));
  }
};

export const acceptInvitation = async (token: string): Promise<AcceptInvitationResult> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.invitations.accept, { token });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not accept the invitation."));
  }
};
