import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrmRecordType } from "@/features/contacts/interfaces/contacts.interfaces";
import {
  getCrmFields,
  getFieldMappings,
  getInternalCrmFields,
  replaceFieldMappings,
} from "@/features/integrations/services/field-mappings.services";
import { notify } from "@/lib/notify";

export const useGetInternalCrmFields = () =>
  useQuery({
    queryKey: ["internal-crm-fields"],
    queryFn: getInternalCrmFields,
    staleTime: 10 * 60 * 1000,
  });

/** Fields of the connected CRM; fails while the connection is not active. */
export const useGetCrmFields = (integrationId: string, recordType: CrmRecordType) =>
  useQuery({
    queryKey: ["crm-fields", integrationId, recordType],
    queryFn: () => getCrmFields({ integrationId, recordType }),
    enabled: !!integrationId,
    retry: false,
  });

/** Connection-level mappings, or one agent's own mappings (plus the inherited ones) when `agentUuid` is set. */
export const useGetFieldMappings = (integrationId: string, agentUuid?: string) =>
  useQuery({
    queryKey: ["field-mappings", integrationId, agentUuid],
    queryFn: () => getFieldMappings({ integrationId, agentUuid }),
    enabled: !!integrationId,
  });

export const useReplaceFieldMappings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: replaceFieldMappings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-mappings"] });
      notify.success("Field mapping saved");
    },
    onError: (error) => notify.error("Could not save field mapping", error.message),
  });
};
