import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AlertsQuery } from "@/features/alerts/interfaces/alerts.interfaces";
import {
  dismissAlert,
  dismissAllAlerts,
  getAlerts,
  getAlertsSummary,
  resolveAlert,
  retryCrmUpdate,
} from "@/features/alerts/services/alerts.services";
import { notify } from "@/lib/notify";

export const useGetAlerts = (query?: AlertsQuery) =>
  useQuery({
    queryKey: ["alerts", query],
    queryFn: () => getAlerts(query),
    placeholderData: keepPreviousData,
  });

export const useGetAlertsSummary = (enabled = true) =>
  useQuery({
    queryKey: ["alerts-summary"],
    queryFn: getAlertsSummary,
    refetchInterval: 60_000,
    enabled,
  });

/** Alerts feed the top-bar count, the alerts page and the dashboard banner. */
const useInvalidateAlerts = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };
};

export const useResolveAlert = () => {
  const invalidateAlerts = useInvalidateAlerts();
  return useMutation({
    mutationFn: resolveAlert,
    onSuccess: () => {
      invalidateAlerts();
      notify.success("Alert marked as resolved");
    },
    onError: (error) => notify.error("Could not resolve the alert", error.message),
  });
};

export const useDismissAlert = () => {
  const invalidateAlerts = useInvalidateAlerts();
  return useMutation({
    mutationFn: dismissAlert,
    onSuccess: () => {
      invalidateAlerts();
      notify.success("Alert dismissed");
    },
    onError: (error) => notify.error("Could not dismiss the alert", error.message),
  });
};

export const useDismissAllAlerts = () => {
  const invalidateAlerts = useInvalidateAlerts();
  return useMutation({
    mutationFn: dismissAllAlerts,
    onSuccess: ({ dismissed }) => {
      invalidateAlerts();
      notify.success(dismissed === 1 ? "1 alert dismissed" : `${dismissed} alerts dismissed`);
    },
    onError: (error) => notify.error("Could not dismiss the alerts", error.message),
  });
};

export const useRetryCrmUpdate = () => {
  const queryClient = useQueryClient();
  const invalidateAlerts = useInvalidateAlerts();
  return useMutation({
    mutationFn: retryCrmUpdate,
    onSuccess: () => {
      invalidateAlerts();
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      queryClient.invalidateQueries({ queryKey: ["call"] });
      notify.success("CRM update queued for retry");
    },
    onError: (error) => notify.error("Could not retry the CRM update", error.message),
  });
};
