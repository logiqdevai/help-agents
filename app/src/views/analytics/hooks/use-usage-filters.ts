"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  UsagePeriods,
  type UsagePeriod,
  type UsageQuery,
} from "@/features/analytics/interfaces/analytics.interfaces";

const DATE_FORMAT = "yyyy-MM-dd";
export const ALL_AGENTS = "all";

/** UI state of the usage report filters, turned into the API query. */
export function useUsageFilters() {
  const [period, setPeriod] = useState<UsagePeriod>(UsagePeriods.LAST_30_DAYS);
  const [from, setFrom] = useState(() => format(subDays(new Date(), 29), DATE_FORMAT));
  const [to, setTo] = useState(() => format(new Date(), DATE_FORMAT));
  const [agentId, setAgentId] = useState<string>(ALL_AGENTS);

  const isCustom = period === UsagePeriods.CUSTOM;
  const isRangeValid = !isCustom || (!!from && !!to && from <= to);

  const query = useMemo<UsageQuery>(
    () => ({
      period,
      ...(isCustom ? { from, to } : {}),
      ...(agentId === ALL_AGENTS ? {} : { agent_uuid: agentId }),
      // Test calls placed from the agent editor count towards company totals.
      include_test: true,
    }),
    [period, isCustom, from, to, agentId],
  );

  return { period, setPeriod, from, setFrom, to, setTo, agentId, setAgentId, isCustom, isRangeValid, query };
}
