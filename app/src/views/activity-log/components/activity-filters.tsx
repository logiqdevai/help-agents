"use client";

import type { FC } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
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
      <SelectField<ActorFilter>
        aria-label="Filter by actor"
        value={actor}
        onValueChange={onActorChange}
        options={ActivityActorTypeFilterOptions}
        groups={
          people.length > 0
            ? [
                {
                  label: "Team members",
                  options: people.map((person) => ({
                    id: `${USER_ACTOR_PREFIX}${person.id}` as ActorFilter,
                    label: person.name,
                  })),
                },
              ]
            : undefined
        }
      />
      <SelectField
        aria-label="Filter by entity type"
        value={entityGroup}
        onValueChange={onEntityGroupChange}
        options={ActivityEntityGroupFilterOptions}
      />
      <SelectField
        aria-label="Filter by date range"
        value={period}
        onValueChange={onPeriodChange}
        options={ActivityPeriodFilterOptions}
      />
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
