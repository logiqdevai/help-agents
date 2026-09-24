import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";

/** Makes another company the active one. Every cached query belongs to the previous company, so the cache is cleared. */
export const useSwitchCompany = () => {
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId);
  const setActiveCompany = useAuthStore((state) => state.setActiveCompany);
  const queryClient = useQueryClient();

  return (companyId: string) => {
    if (companyId === activeCompanyId) return;
    setActiveCompany(companyId);
    queryClient.clear();
  };
};
