import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ScheduledCallStatuses,
  ScheduleModes,
  type ScheduledCall,
  type ScheduledCallsQuery,
} from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import {
  cancelScheduledCall,
  createScheduledCall,
  getCallingHours,
  getScheduledCallCounts,
  getScheduledCalls,
  updateScheduledCall,
} from "@/features/scheduled-calls/services/scheduled-calls.services";
import { formatDateTime } from "@/lib/format";
import { notify } from "@/lib/notify";

// A "call now" that lands further out than this was pushed to the next allowed calling time.
const CALL_NOW_TOLERANCE_MS = 2 * 60 * 1000;

// Calls that are dialing, or due within the next dispatcher run, change state quickly.
const DISPATCH_WINDOW_MS = 90 * 1000;
const DISPATCH_POLL_MS = 10_000;

const isDispatching = (scheduledCall: ScheduledCall) =>
  scheduledCall.status === ScheduledCallStatuses.IN_PROGRESS ||
  (scheduledCall.status === ScheduledCallStatuses.PENDING &&
    new Date(scheduledCall.scheduled_for).getTime() - Date.now() < DISPATCH_WINDOW_MS);

export const useGetScheduledCalls = (query?: ScheduledCallsQuery) =>
  useQuery({
    queryKey: ["scheduled-calls", query],
    queryFn: () => getScheduledCalls(query),
    placeholderData: keepPreviousData,
    refetchInterval: (result) => (result.state.data?.data.some(isDispatching) ? DISPATCH_POLL_MS : false),
  });

export const useGetScheduledCallCounts = () =>
  useQuery({
    queryKey: ["scheduled-call-counts"],
    queryFn: getScheduledCallCounts,
  });

export const useGetCallingHours = () =>
  useQuery({
    queryKey: ["calling-hours"],
    queryFn: getCallingHours,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateScheduledCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScheduledCall,
    onSuccess: (scheduled) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-calls"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-call-counts"] });
      notify.success("Call scheduled", `Planned for ${formatDateTime(scheduled.scheduled_for)}.`);
    },
    onError: (error) => notify.error("Could not schedule the call", error.message),
  });
};

export const useRescheduleScheduledCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateScheduledCall,
    onSuccess: (scheduled) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-calls"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-call-counts"] });
      notify.success("Call rescheduled", `Planned for ${formatDateTime(scheduled.scheduled_for)}.`);
    },
    onError: (error) => notify.error("Could not reschedule the call", error.message),
  });
};

/** Moves a pending call to "as soon as allowed"; the dispatcher then dials within a minute. */
export const useCallScheduledCallNow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => updateScheduledCall({ id, dto: { when: { mode: ScheduleModes.IMMEDIATELY } } }),
    onSuccess: (scheduled) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-calls"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-call-counts"] });
      if (new Date(scheduled.scheduled_for).getTime() - Date.now() > CALL_NOW_TOLERANCE_MS) {
        notify.info(
          "Outside calling hours",
          `The call was moved to the next allowed time: ${formatDateTime(scheduled.scheduled_for)}.`,
        );
      } else {
        notify.success("Calling now", "The agent will dial within a minute.");
      }
    },
    onError: (error) => notify.error("Could not start the call", error.message),
  });
};

export const useCancelScheduledCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelScheduledCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-calls"] });
      queryClient.invalidateQueries({ queryKey: ["scheduled-call-counts"] });
      notify.success("Scheduled call canceled");
    },
    onError: (error) => notify.error("Could not cancel the scheduled call", error.message),
  });
};
