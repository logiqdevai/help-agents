import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrmToolsQuery } from "@/features/integrations/interfaces/integrations.interfaces";
import {
  createCrmTool,
  deleteCrmTool,
  getIntegrationCrmTools,
  updateCrmTool,
} from "@/features/integrations/services/crm-tools.services";
import { notify } from "@/lib/notify";

/** Tools of one CRM connection: the provider catalogue plus tools defined on the connection. */
export const useGetIntegrationCrmTools = (integrationId: string, query?: CrmToolsQuery) =>
  useQuery({
    queryKey: ["crm-tools", integrationId, query],
    queryFn: () => getIntegrationCrmTools(integrationId, query),
    enabled: !!integrationId,
  });

export const useCreateCrmTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCrmTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tools"] });
      notify.success("Tool added");
    },
    onError: (error) => notify.error("Could not add tool", error.message),
  });
};

export const useUpdateCrmTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCrmTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tools"] });
      notify.success("Tool updated");
    },
    onError: (error) => notify.error("Could not update tool", error.message),
  });
};

export const useDeleteCrmTool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCrmTool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-tools"] });
      notify.success("Tool deleted");
    },
    onError: (error) => notify.error("Could not delete tool", error.message),
  });
};
