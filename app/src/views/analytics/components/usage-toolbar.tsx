"use client";

import type { FC } from "react";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { UsagePeriodFormOptions } from "@/config/constants/dropdowns/analytics/usage-period-form.options";
import type { AgentFilterOption, UsagePeriod } from "@/features/analytics/interfaces/analytics.interfaces";
import { ALL_AGENTS } from "@/views/analytics/hooks/use-usage-filters";

interface UsageToolbarProps {
  period: UsagePeriod;
  onPeriodChange: (period: UsagePeriod) => void;
  isCustom: boolean;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  isRangeValid: boolean;
  agentId: string;
  onAgentChange: (agentId: string) => void;
  agents: AgentFilterOption[];
}

export const UsageToolbar: FC<UsageToolbarProps> = ({
  period,
  onPeriodChange,
  isCustom,
  from,
  to,
  onFromChange,
  onToChange,
  isRangeValid,
  agentId,
  onAgentChange,
  agents,
}) => (
  <div className="flex flex-wrap items-center gap-3">
    <SegmentedControl
      aria-label="Time period"
      value={period}
      onValueChange={onPeriodChange}
      options={UsagePeriodFormOptions}
    />
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
    <NativeSelect
      aria-label="Filter by agent"
      value={agentId}
      onChange={(event) => onAgentChange(event.target.value)}
      className="ml-auto"
    >
      <NativeSelectOption value={ALL_AGENTS}>All agents</NativeSelectOption>
      {agents.map((agent) => (
        <NativeSelectOption key={agent.id} value={agent.id}>
          {agent.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  </div>
);
