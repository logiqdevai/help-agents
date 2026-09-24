"use client";

import type { FC } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { ActivityActorTypeFilterOptions } from "@/config/constants/dropdowns/activity/activity-actor-filter.options";
import {
  ActivityEntityGroupFilterOptions,
  type ActivityEntityGroup,
} from "@/config/constants/dropdowns/activity/activity-entity-group-filter.options";
import {
  ActivityPeriodFilterOptions,
  type ActivityPeriod,
} from "@/config/constants/dropdowns/activity/activity-period-filter.options";
import type { ActivityActorOption } from "@/features/activity-log/interfaces/activity-log.interfaces";
import { USER_ACTOR_PREFIX, type ActorFilter } from "@/views/activity-log/hooks/use-activity-filters";

interface ActivityFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  actor: ActorFilter;
  onActorChange: (value: ActorFilter) => void;
  people: ActivityActorOption[];
  entityGroup: ActivityEntityGroup | "all";
  onEntityGroupChange: (value: ActivityEntityGroup | "all") => void;
  period: ActivityPeriod;
  onPeriodChange: (value: ActivityPeriod) => void;
  isCustom: boolean;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  isRangeValid: boolean;
}

export const ActivityFilters: FC<ActivityFiltersProps> = ({
  search,
  onSearchChange,
  actor,
  onActorChange,
  people,
  entityGroup,
  onEntityGroupChange,
  period,
  onPeriodChange,
  isCustom,
  from,
  to,
  onFromChange,
  onToChange,
  isRangeValid,
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Search actions or people"
          placeholder="Search actions or people"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <NativeSelect
        aria-label="Filter by actor"
        value={actor}
        onChange={(event) => onActorChange(event.target.value as ActorFilter)}
      >
        {ActivityActorTypeFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
        {people.length > 0 ? (
          <NativeSelectOptGroup label="Team members">
            {people.map((person) => (
              <NativeSelectOption key={person.id} value={`${USER_ACTOR_PREFIX}${person.id}`}>
                {person.name}
              </NativeSelectOption>
            ))}
          </NativeSelectOptGroup>
        ) : null}
      </NativeSelect>
      <NativeSelect
        aria-label="Filter by entity type"
        value={entityGroup}
        onChange={(event) => onEntityGroupChange(event.target.value as ActivityEntityGroup | "all")}
      >
        {ActivityEntityGroupFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Filter by date range"
        value={period}
        onChange={(event) => onPeriodChange(event.target.value as ActivityPeriod)}
      >
        {ActivityPeriodFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
    {isCustom ? (
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          aria-label="From date"
          aria-invalid={!isRangeValid}
          value={from}
          max={to || undefined}
          onChange={(event) => onFromChange(event.target.value)}
          className="w-auto"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          aria-label="To date"
          aria-invalid={!isRangeValid}
          value={to}
          min={from || undefined}
          onChange={(event) => onToChange(event.target.value)}
          className="w-auto"
        />
        {!isRangeValid ? (
          <span role="alert" className="text-sm text-destructive">
            Choose a start date that is not after the end date.
          </span>
        ) : null}
      </div>
    ) : null}
  </div>
);
