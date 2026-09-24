import axios from "axios";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";
import { getAuthStoreState } from "@/stores/auth";

const axiosInstance = axios.create({
  baseURL: environments.apiUrl,
});

// Auth endpoints answer 401 for bad credentials — those must reach the form, not trigger a logout.
const isAuthEndpoint = (url?: string) =>
  !!url && url.startsWith("/auth/") && !url.startsWith("/auth/me");

axiosInstance.interceptors.request.use((config) => {
  const { accessToken, activeCompanyId } = getAuthStoreState();
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  if (activeCompanyId) config.headers.set("X-Company-Id", activeCompanyId);
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      getAuthStoreState().accessToken &&
      !isAuthEndpoint(error.config?.url)
    ) {
      getAuthStoreState().clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth/")) {
        window.location.href = Routes.auth.login;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

/** Turns any thrown value (usually an AxiosError from the API) into a human-readable message. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length) return String(message[0]);
    if (typeof message === "string" && message) return message;
    if (!error.response) return "Could not reach the server. Check your connection and try again.";
  }
  return fallback;
}
