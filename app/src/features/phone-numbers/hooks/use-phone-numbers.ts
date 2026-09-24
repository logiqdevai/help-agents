import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PhoneNumbersQuery } from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import {
  assignPhoneNumberAgent,
  getPhoneNumbers,
  importPhoneNumber,
  provisionPhoneNumber,
  releasePhoneNumber,
  updatePhoneNumber,
} from "@/features/phone-numbers/services/phone-numbers.services";
import { notify } from "@/lib/notify";

export const useGetPhoneNumbers = (query?: PhoneNumbersQuery) =>
  useQuery({
    queryKey: ["phone-numbers", query],
    queryFn: () => getPhoneNumbers(query),
    placeholderData: keepPreviousData,
  });

export const useProvisionPhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: provisionPhoneNumber,
    onSuccess: ({ phone, agentError }) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (agentError) {
        notify.warning(`${phone.number} is ready, but no agent was assigned`, agentError);
      } else {
        notify.success("Phone number added", `${phone.number} is ready to use.`);
      }
    },
    onError: (error) => notify.error("Could not get a phone number", error.message),
  });
};

export const useImportPhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importPhoneNumber,
    onSuccess: (phone) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      notify.success("Phone number connected", `${phone.number} is ready to use.`);
    },
    onError: (error) => notify.error("Could not connect the phone number", error.message),
  });
};

export const useUpdatePhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePhoneNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      notify.success("Label saved");
    },
    onError: (error) => notify.error("Could not save the label", error.message),
  });
};

export const useAssignPhoneNumberAgent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignPhoneNumberAgent,
    onSuccess: (phone) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      notify.success(
        phone.agent ? "Agent assigned" : "Agent unassigned",
        phone.agent ? `${phone.agent.name} now uses ${phone.number}.` : `${phone.number} no longer has an agent.`,
      );
    },
    onError: (error) => notify.error("Could not update the agent", error.message),
  });
};

export const useReleasePhoneNumber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: releasePhoneNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      notify.success("Phone number released");
    },
    onError: (error) => notify.error("Could not release the phone number", error.message),
  });
};
