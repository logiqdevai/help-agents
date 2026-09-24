"use client";

import type { FC } from "react";
import { SearchIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CallDateRangeFilterOptions } from "@/config/constants/dropdowns/calls/call-date-range-filter.options";
import { CallDirectionFilterOptions } from "@/config/constants/dropdowns/calls/call-direction-filter.options";
import { CallStatusFilterOptions } from "@/config/constants/dropdowns/calls/call-status-filter.options";
import {
  CallDateRanges,
  type CallDateRange,
  type CallDirection,
  type CallFilterOptions,
  type CallStatus,
} from "@/features/calls/interfaces/calls.interfaces";
import type { CallsFilterState } from "@/views/calls/hooks/use-calls-filters";

interface CallsFiltersProps {
  filters: CallsFilterState;
  options: CallFilterOptions | undefined;
  onChange: <K extends keyof CallsFilterState>(key: K, value: CallsFilterState[K]) => void;
}

const selectClass = "w-full sm:w-auto";

export const CallsFilters: FC<CallsFiltersProps> = ({ filters, options, onChange }) => (
  <div className="flex flex-col gap-3">
    <div role="search" className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-60 flex-1 basis-64">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
          placeholder="Search contact, phone number or call #"
          aria-label="Search calls"
          className="pl-8"
        />
      </div>
      <NativeSelect
        className={selectClass}
        aria-label="Agent"
        value={filters.agentId}
        onChange={(event) => onChange("agentId", event.target.value)}
      >
        <NativeSelectOption value="">All agents</NativeSelectOption>
        {options?.agents.map((agent) => (
          <NativeSelectOption key={agent.id} value={agent.id}>
            {agent.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        className={selectClass}
        aria-label="Date range"
        value={filters.dateRange}
        onChange={(event) => onChange("dateRange", event.target.value as CallDateRange | "all")}
      >
        {CallDateRangeFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        className={selectClass}
        aria-label="Outcome"
        value={filters.outcomeKey}
        onChange={(event) => onChange("outcomeKey", event.target.value)}
      >
        <NativeSelectOption value="">All outcomes</NativeSelectOption>
        {options?.outcomes.map((outcome) => (
          <NativeSelectOption key={outcome.key} value={outcome.key}>
            {outcome.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        className={selectClass}
        aria-label="Status"
        value={filters.status}
        onChange={(event) => onChange("status", event.target.value as CallStatus | "all")}
      >
        {CallStatusFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <NativeSelect
        className={selectClass}
        aria-label="Direction"
        value={filters.direction}
        onChange={(event) => onChange("direction", event.target.value as CallDirection | "all")}
      >
        {CallDirectionFilterOptions.map((option) => (
          <NativeSelectOption key={option.id} value={option.id}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {options?.integrations.length ? (
        <NativeSelect
          className={selectClass}
          aria-label="CRM"
          value={filters.integrationId}
          onChange={(event) => onChange("integrationId", event.target.value)}
        >
          <NativeSelectOption value="">Any CRM</NativeSelectOption>
          {options.integrations.map((integration) => (
            <NativeSelectOption key={integration.id} value={integration.id}>
              {integration.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ) : null}
    </div>

    {filters.dateRange === CallDateRanges.CUSTOM ? (
      <div className="flex flex-wrap items-center gap-3">
        <Label htmlFor="calls-from" className="gap-2">
          From
          <Input
            id="calls-from"
            type="date"
            value={filters.customFrom}
            max={filters.customTo || undefined}
            onChange={(event) => onChange("customFrom", event.target.value)}
            className="w-auto"
          />
        </Label>
        <Label htmlFor="calls-to" className="gap-2">
          To
          <Input
            id="calls-to"
            type="date"
            value={filters.customTo}
            min={filters.customFrom || undefined}
            onChange={(event) => onChange("customTo", event.target.value)}
            className="w-auto"
          />
        </Label>
      </div>
    ) : null}

    <Label htmlFor="calls-hide-test" className="w-fit cursor-pointer gap-2 font-normal">
      <Checkbox
        id="calls-hide-test"
        checked={filters.hideTest}
        onCheckedChange={(checked) => onChange("hideTest", checked)}
      />
      Hide test calls
    </Label>
  </div>
);
