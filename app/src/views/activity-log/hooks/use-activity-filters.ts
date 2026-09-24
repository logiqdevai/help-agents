"use client";

import { useMemo, useState } from "react";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import {
  ActivityEntityGroupFilterOptions,
  type ActivityEntityGroup,
} from "@/config/constants/dropdowns/activity/activity-entity-group-filter.options";
import {
  ActivityPeriods,
  type ActivityPeriod,
} from "@/config/constants/dropdowns/activity/activity-period-filter.options";
import type { ActivityLogQuery, ActorType } from "@/features/activity-log/interfaces/activity-log.interfaces";
import { useDebouncedValue } from "@/views/activity-log/hooks/use-debounced-value";

export const PAGE_SIZE = 25;
/** Prefix of the actor filter value that selects one team member: "user:<id>". */
export const USER_ACTOR_PREFIX = "user:";
export type ActorFilter = ActorType | "all" | `user:${string}`;

const DATE_FORMAT = "yyyy-MM-dd";

/** UI state of the activity log filters, turned into the API query. */
export function useActivityFilters() {
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState<ActorFilter>("all");
  const [entityGroup, setEntityGroup] = useState<ActivityEntityGroup | "all">("all");
  const [period, setPeriod] = useState<ActivityPeriod>(ActivityPeriods.LAST_7_DAYS);
  const [from, setFrom] = useState(() => format(subDays(new Date(), 6), DATE_FORMAT));
  const [to, setTo] = useState(() => format(new Date(), DATE_FORMAT));
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const isCustom = period === ActivityPeriods.CUSTOM;
  const isRangeValid = !isCustom || (!!from && !!to && from <= to);

  const query = useMemo<ActivityLogQuery>(() => {
    const daysBack = { [ActivityPeriods.TODAY]: 0, [ActivityPeriods.LAST_7_DAYS]: 6, [ActivityPeriods.LAST_30_DAYS]: 29 };
    const range =
      period === ActivityPeriods.CUSTOM
        ? {
            from: new Date(`${from}T00:00:00`).toISOString(),
            to: endOfDay(new Date(`${to}T00:00:00`)).toISOString(),
          }
        : { from: startOfDay(subDays(new Date(), daysBack[period])).toISOString() };
    const entityTypes = ActivityEntityGroupFilterOptions.find((group) => group.id === entityGroup)?.entityTypes ?? [];

    return {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      user_uuid: actor.startsWith(USER_ACTOR_PREFIX) ? actor.slice(USER_ACTOR_PREFIX.length) : undefined,
      actor_type: actor === "all" || actor.startsWith(USER_ACTOR_PREFIX) ? undefined : (actor as ActorType),
      entity_type: entityTypes.length ? entityTypes.join(",") : undefined,
      ...range,
    };
  }, [page, debouncedSearch, actor, entityGroup, period, from, to]);

  /** Any filter change goes back to the first page. */
  const withReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return {
    search,
    setSearch: withReset(setSearch),
    actor,
    setActor: withReset(setActor),
    entityGroup,
    setEntityGroup: withReset(setEntityGroup),
    period,
    setPeriod: withReset(setPeriod),
    from,
    setFrom: withReset(setFrom),
    to,
    setTo: withReset(setTo),
    page,
    setPage,
    isCustom,
    isRangeValid,
    query,
  };
}
