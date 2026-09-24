import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "@/features/auth/services/auth.services";
import {
  acceptInvitation,
  getInvitationPreview,
} from "@/features/invitations/services/invitations.services";
import { notify } from "@/lib/notify";
import { useAuthStore } from "@/stores/auth";

export const useInvitationPreview = (token: string) =>
  useQuery({
    queryKey: ["invitation-preview", token],
    queryFn: () => getInvitationPreview(token),
    enabled: !!token,
    retry: false,
  });

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany);
  return useMutation({
    mutationFn: async (token: string) => {
      const result = await acceptInvitation(token);
      // Refresh memberships so the newly joined company shows up (and becomes active).
      const profile = await getProfile();
      return { result, profile };
    },
    onSuccess: ({ result, profile }) => {
      setProfile(profile);
      setActiveCompany(result.company.id);
      queryClient.clear();
      notify.success(`Joined ${result.company.name}`);
    },
    onError: (error) => notify.error("Could not accept invitation", error.message),
  });
};
