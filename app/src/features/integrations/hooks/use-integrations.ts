import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IntegrationsQuery } from "@/features/integrations/interfaces/integrations.interfaces";
import {
  createIntegration,
  deleteIntegration,
  getIntegration,
  getIntegrationAgents,
  getIntegrationProviders,
  getIntegrations,
  startIntegrationOAuth,
  testIntegration,
  updateIntegration,
} from "@/features/integrations/services/integrations.services";
import { notify } from "@/lib/notify";

export const useGetIntegrations = (query?: IntegrationsQuery) =>
  useQuery({
    queryKey: ["integrations", query],
    queryFn: () => getIntegrations(query),
    placeholderData: keepPreviousData,
  });

export const useGetIntegration = (id: string) =>
  useQuery({
    queryKey: ["integration", id],
    queryFn: () => getIntegration(id),
    enabled: !!id,
  });

export const useGetIntegrationProviders = () =>
  useQuery({
    queryKey: ["integration-providers"],
    queryFn: getIntegrationProviders,
    staleTime: 5 * 60 * 1000,
  });

export const useGetIntegrationAgents = (id: string) =>
  useQuery({
    queryKey: ["integration-agents", id],
    queryFn: () => getIntegrationAgents(id),
    enabled: !!id,
  });

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIntegration,
    onSuccess: (integration) => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      notify.success("Connection saved", `${integration.name} has been added.`);
    },
    onError: (error) => notify.error("Could not save connection", error.message),
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integration"] });
      notify.success("Connection updated");
    },
    onError: (error) => notify.error("Could not update connection", error.message),
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      notify.success("Integration disconnected");
    },
    onError: (error) => notify.error("Could not disconnect", error.message),
  });
};

export const useTestIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: testIntegration,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      queryClient.invalidateQueries({ queryKey: ["integration"] });
      if (result.verified) notify.success("Connection verified");
      else if (result.error) notify.error("Connection failed", result.error);
      else notify.info("Credentials are saved", "This app does not support a live check yet.");
    },
    onError: (error) => notify.error("Could not test connection", error.message),
  });
};

export const useStartIntegrationOAuth = () =>
  useMutation({
    mutationFn: startIntegrationOAuth,
    onSuccess: ({ authorization_url }) => {
      notify.info("Redirecting to sign in", "You will be brought back here once access is approved.");
      window.location.assign(authorization_url);
    },
    onError: (error) => notify.error("Could not start sign-in", error.message),
  });
