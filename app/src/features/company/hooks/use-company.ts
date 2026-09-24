import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelCompanyDeletion,
  getCallingHours,
  getCompany,
  getDeletionStatus,
  getMyCompanies,
  requestCompanyDeletion,
  setCallingHours,
  updateCompany,
} from "@/features/company/services/company.services";
import { notify } from "@/lib/notify";
import { useAuthStore } from "@/stores/auth";

const COMPANY_KEY = "company";
const MY_COMPANIES_KEY = "my-companies";
const CALLING_HOURS_KEY = "company-calling-hours";
const DELETION_STATUS_KEY = "company-deletion-status";

export const useGetCompany = () => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [COMPANY_KEY, activeCompanyId],
    queryFn: getCompany,
    enabled: !!activeCompanyId,
  });
};

export const useGetMyCompanies = () =>
  useQuery({
    queryKey: [MY_COMPANIES_KEY],
    queryFn: getMyCompanies,
  });

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const companies = useAuthStore((state) => state.companies);
  const setProfile = useAuthStore((state) => state.setProfile);
  return useMutation({
    mutationFn: updateCompany,
    onSuccess: (company) => {
      // Keep the company name shown in the sidebar switcher in sync.
      setProfile({ companies: companies.map((c) => (c.id === company.id ? { ...c, name: company.name } : c)) });
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MY_COMPANIES_KEY] });
      queryClient.invalidateQueries({ queryKey: [CALLING_HOURS_KEY] });
      notify.success("Company settings saved");
    },
    onError: (error) => notify.error("Could not save company settings", error.message),
  });
};

export const useGetCallingHours = () => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [CALLING_HOURS_KEY, activeCompanyId],
    queryFn: getCallingHours,
    enabled: !!activeCompanyId,
  });
};

export const useSetCallingHours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setCallingHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALLING_HOURS_KEY] });
      notify.success("Calling hours saved");
    },
    onError: (error) => notify.error("Could not save calling hours", error.message),
  });
};

export const useGetDeletionStatus = () => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  return useQuery({
    queryKey: [DELETION_STATUS_KEY, activeCompanyId],
    queryFn: getDeletionStatus,
    enabled: !!activeCompanyId,
  });
};

export const useRequestCompanyDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestCompanyDeletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELETION_STATUS_KEY] });
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      notify.success("Deletion requested", "You can cancel until the grace period ends.");
    },
    onError: (error) => notify.error("Could not request deletion", error.message),
  });
};

export const useCancelCompanyDeletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelCompanyDeletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DELETION_STATUS_KEY] });
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      notify.success("Deletion request cancelled");
    },
    onError: (error) => notify.error("Could not cancel the request", error.message),
  });
};
