import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createInvitation,
  getAgentOptions,
  getInvitations,
  getMemberAgentAccess,
  getMembers,
  leaveCompany,
  removeMember,
  resendInvitation,
  revokeInvitation,
  setMemberAgentAccess,
  updateMember,
} from "@/features/team/services/team.services";
import type { InvitationsQuery, MembersQuery } from "@/features/team/interfaces/team.interfaces";
import { notify } from "@/lib/notify";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";

const MEMBERS_KEY = "company-members";
const INVITATIONS_KEY = "company-invitations";
const AGENT_ACCESS_KEY = "company-member-agent-access";
const AGENT_OPTIONS_KEY = "team-agent-options";

export const useGetMembers = (query?: MembersQuery) => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [MEMBERS_KEY, activeCompanyId, query],
    queryFn: () => getMembers(query),
    enabled: !!activeCompanyId,
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] });
      notify.success("Role updated");
    },
    onError: (error) => notify.error("Could not update role", error.message),
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] });
      notify.success("Member removed");
    },
    onError: (error) => notify.error("Could not remove member", error.message),
  });
};

/** Leaves the active company, then moves to another membership (or back to login when none is left). */
export const useLeaveCompany = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const companies = useAuthStore((state) => state.companies);
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const setProfile = useAuthStore((state) => state.setProfile);
  const clear = useAuthStore((state) => state.clear);
  return useMutation({
    mutationFn: leaveCompany,
    onSuccess: () => {
      const remaining = companies.filter((company) => company.id !== activeCompanyId);
      queryClient.clear();
      notify.success("You left the company");
      if (remaining.length === 0) {
        clear();
        router.replace(Routes.auth.login);
        return;
      }
      setProfile({ companies: remaining });
      router.replace(Routes.dashboard);
    },
    onError: (error) => notify.error("Could not leave the company", error.message),
  });
};

export const useGetMemberAgentAccess = (memberId: string | null) =>
  useQuery({
    queryKey: [AGENT_ACCESS_KEY, memberId],
    queryFn: () => getMemberAgentAccess(memberId as string),
    enabled: !!memberId,
  });

export const useSetMemberAgentAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setMemberAgentAccess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AGENT_ACCESS_KEY] });
      queryClient.invalidateQueries({ queryKey: [MEMBERS_KEY] });
      notify.success("Agent access saved");
    },
    onError: (error) => notify.error("Could not save agent access", error.message),
  });
};

/** Runtime-derived picker options: every agent of the active company as id + name + status. */
export const useGetAgentOptions = () => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [AGENT_OPTIONS_KEY, activeCompanyId],
    queryFn: getAgentOptions,
    enabled: !!activeCompanyId,
  });
};

export const useGetInvitations = (query?: InvitationsQuery) => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [INVITATIONS_KEY, activeCompanyId, query],
    queryFn: () => getInvitations(query),
    enabled: !!activeCompanyId,
  });
};

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvitation,
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_KEY] });
      if (invitation.email_sent) {
        notify.success("Invitation sent", `An email with a link to join was sent to ${invitation.email}.`);
      } else {
        notify.warning("Invitation created", `We could not email ${invitation.email}. Use Resend to try again.`);
      }
    },
    onError: (error) => notify.error("Could not send invitation", error.message),
  });
};

export const useResendInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_KEY] });
      if (invitation.email_sent) {
        notify.success("Invitation resent", `A fresh link was sent to ${invitation.email}.`);
      } else {
        notify.warning("Invitation refreshed", `We could not email ${invitation.email}. Try again in a moment.`);
      }
    },
    onError: (error) => notify.error("Could not resend invitation", error.message),
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_KEY] });
      notify.success("Invitation revoked");
    },
    onError: (error) => notify.error("Could not revoke invitation", error.message),
  });
};
