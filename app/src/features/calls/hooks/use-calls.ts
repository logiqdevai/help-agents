import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CallStatuses,
  LiveCallStatuses,
  ProcessingStatuses,
  type CallDetail,
  type CallsQuery,
} from "@/features/calls/interfaces/calls.interfaces";
import {
  getCall,
  getCallAgentOptions,
  getCallFilterOptions,
  getCallRecording,
  getCalls,
  placeCall,
  placeTestCall,
  retryCallAction,
  stopCall,
} from "@/features/calls/services/calls.services";
import { notify } from "@/lib/notify";

const LIVE_POLL_MS = 5_000;
const ANALYSIS_POLL_MS = 10_000;
// The AI summary, outcome and cost land shortly after a call ends; stop waiting after this long.
const ANALYSIS_WAIT_MS = 10 * 60 * 1000;
// Signed recording URLs live 15 minutes on the API.
const RECORDING_STALE_MS = 10 * 60 * 1000;

const isLive = (status: CallDetail["status"]) => LiveCallStatuses.includes(status);

const isAwaitingAnalysis = (call: CallDetail) =>
  (call.status === CallStatuses.COMPLETED || call.status === CallStatuses.TRANSFERRED) &&
  (call.analysis_status === ProcessingStatuses.PENDING || call.analysis_status === ProcessingStatuses.PROCESSING) &&
  !!call.ended_at &&
  Date.now() - new Date(call.ended_at).getTime() < ANALYSIS_WAIT_MS;

export const useGetCalls = (query?: CallsQuery) =>
  useQuery({
    queryKey: ["calls", query],
    queryFn: () => getCalls(query),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.data.some((call) => isLive(call.status)) ? LIVE_POLL_MS : false,
  });

export const useGetCallFilterOptions = () =>
  useQuery({
    queryKey: ["call-filters"],
    queryFn: getCallFilterOptions,
    staleTime: 60_000,
  });

export const useGetCall = (id: string) =>
  useQuery({
    queryKey: ["call", id],
    queryFn: () => getCall(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const call = query.state.data;
      if (!call) return false;
      if (isLive(call.status)) return LIVE_POLL_MS;
      return isAwaitingAnalysis(call) ? ANALYSIS_POLL_MS : false;
    },
  });

export const useGetCallRecording = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: ["call-recording", id],
    queryFn: () => getCallRecording(id),
    enabled: enabled && !!id,
    staleTime: RECORDING_STALE_MS,
  });

/** Agents to pick from; live and scheduled calls need an active agent, test calls accept any. */
export const useGetCallAgentOptions = (activeOnly: boolean) =>
  useQuery({
    queryKey: ["call-agent-options", activeOnly],
    queryFn: () => getCallAgentOptions(activeOnly),
    staleTime: 60_000,
  });

export const useRetryCallAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryCallAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call"] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      notify.success("CRM update retried", "We will show the result here in a moment.");
    },
    onError: (error) => notify.error("Could not retry the CRM update", error.message),
  });
};

export const useStopCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stopCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call"] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      notify.success("Stopping the call");
    },
    onError: (error) => notify.error("Could not stop the call", error.message),
  });
};

export const usePlaceTestCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeTestCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      notify.success("Test call started", "Your phone should ring in a few seconds.");
    },
    onError: (error) => notify.error("Could not start the test call", error.message),
  });
};

export const usePlaceCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: placeCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      notify.success("Call started", "The agent is dialing now.");
    },
    onError: (error) => notify.error("Could not start the call", error.message),
  });
};
