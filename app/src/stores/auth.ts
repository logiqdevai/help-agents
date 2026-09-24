import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { AuthCompany, AuthSession, AuthUser } from "@/features/auth/interfaces/auth.interfaces";

const STORE_KEY = "auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  companies: AuthCompany[];
  activeCompanyId: string | null;
  setSession: (session: Pick<AuthSession, "access_token" | "user" | "companies">) => void;
  setProfile: (profile: { user?: AuthUser; companies?: AuthCompany[] }) => void;
  setActiveCompany: (companyId: string) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        accessToken: null,
        user: null,
        companies: [],
        activeCompanyId: null,
        setSession: ({ access_token, user, companies }) => {
          const current = get().activeCompanyId;
          set({
            accessToken: access_token,
            user,
            companies,
            activeCompanyId: companies.some((c) => c.id === current)
              ? current
              : (companies[0]?.id ?? null),
          });
        },
        setProfile: ({ user, companies }) => {
          const nextCompanies = companies ?? get().companies;
          const current = get().activeCompanyId;
          set({
            user: user ?? get().user,
            companies: nextCompanies,
            activeCompanyId: nextCompanies.some((c) => c.id === current)
              ? current
              : (nextCompanies[0]?.id ?? null),
          });
        },
        setActiveCompany: (companyId) => set({ activeCompanyId: companyId }),
        clear: () => set({ accessToken: null, user: null, companies: [], activeCompanyId: null }),
      }),
      {
        name: STORE_KEY,
        partialize: (state) => ({
          accessToken: state.accessToken,
          user: state.user,
          companies: state.companies,
          activeCompanyId: state.activeCompanyId,
        }),
      },
    ),
    { name: STORE_KEY },
  ),
);

export const getAuthStoreState = () => useAuthStore.getState();
