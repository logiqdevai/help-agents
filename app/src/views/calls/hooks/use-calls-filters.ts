import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  CallDateRanges,
  type CallDateRange,
  type CallDirection,
  type CallsQuery,
  type CallStatus,
} from "@/features/calls/interfaces/calls.interfaces";
import { useDebouncedValue } from "@/views/calls/hooks/use-debounced-value";

const PAGE_SIZE = 20;
const DATE_FORMAT = "yyyy-MM-dd";

export interface CallsFilterState {
  search: string;
  agentId: string;
  dateRange: CallDateRange | "all";
  customFrom: string;
  customTo: string;
  outcomeKey: string;
  status: CallStatus | "all";
  direction: CallDirection | "all";
  integrationId: string;
  hideTest: boolean;
}

const initialFilters: CallsFilterState = {
  search: "",
  agentId: "",
  dateRange: "all",
  customFrom: "",
  customTo: "",
  outcomeKey: "",
  status: "all",
  direction: "all",
  integrationId: "",
  hideTest: false,
};

function resolveDateRange(filters: CallsFilterState): Pick<CallsQuery, "from" | "to"> {
  const today = new Date();
  switch (filters.dateRange) {
    case CallDateRanges.TODAY:
      return { from: format(today, DATE_FORMAT), to: format(today, DATE_FORMAT) };
    case CallDateRanges.LAST_7_DAYS:
      return { from: format(subDays(today, 6), DATE_FORMAT), to: format(today, DATE_FORMAT) };
    case CallDateRanges.LAST_30_DAYS:
      return { from: format(subDays(today, 29), DATE_FORMAT), to: format(today, DATE_FORMAT) };
    case CallDateRanges.CUSTOM:
      return { from: filters.customFrom || undefined, to: filters.customTo || undefined };
    default:
      return {};
  }
}

/** UI state of the calls list: every filter change goes back to page 1. */
export function useCallsFilters() {
  const [filters, setFilters] = useState<CallsFilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const search = useDebouncedValue(filters.search.trim());

  const setFilter = <K extends keyof CallsFilterState>(key: K, value: CallsFilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const reset = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  const query = useMemo<CallsQuery>(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      agent_uuid: filters.agentId || undefined,
      outcome_key: filters.outcomeKey || undefined,
      status: filters.status,
      direction: filters.direction,
      integration_uuid: filters.integrationId || undefined,
      is_test: filters.hideTest ? "false" : "all",
      ...resolveDateRange(filters),
    }),
    [filters, page, search],
  );

  const hasActiveFilters = (Object.keys(initialFilters) as (keyof CallsFilterState)[]).some(
    (key) => filters[key] !== initialFilters[key],
  );

  return { filters, setFilter, reset, query, page, setPage, hasActiveFilters };
}
