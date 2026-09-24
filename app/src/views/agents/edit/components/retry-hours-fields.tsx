"use client";

import type { FC } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { BuildingIcon, ClockIcon } from "lucide-react";
import { ChoiceCardGroup } from "@/components/ui/choice-card-group";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RetryHoursFormOptions } from "@/config/constants/dropdowns/agents/retry-hours-form.options";
import { WeekdayFormOptions } from "@/config/constants/dropdowns/company/weekday.options";
import { RetryHoursModes, type RetryHoursMode } from "@/features/agents/interfaces/agents.interfaces";
import type { RetryRuleFormData } from "@/features/agents/validation-schemas/agents.schema";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";
import { summarizeCallingHours } from "@/views/calls/utils/calling-hours";

const hoursIcons = { [RetryHoursModes.COMPANY]: BuildingIcon, [RetryHoursModes.CUSTOM]: ClockIcon };

interface RetryHoursFieldsProps {
  form: UseFormReturn<RetryRuleFormData>;
  companyHours: CallingHours | undefined;
}

/** Retries follow the company calling hours unless this agent gets windows of its own. */
export const RetryHoursFields: FC<RetryHoursFieldsProps> = ({ form, companyHours }) => {
  const mode = useWatch({ control: form.control, name: "hours_mode" });
  const days = useWatch({ control: form.control, name: "days" });

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name="hours_mode"
        render={({ field }) => (
          <ChoiceCardGroup<RetryHoursMode>
            name="retry-hours-mode"
            aria-label="Allowed calling hours"
            value={field.value}
            onValueChange={field.onChange}
            options={RetryHoursFormOptions.map((option) => ({ ...option, icon: hoursIcons[option.id] }))}
          />
        )}
      />

      {mode === RetryHoursModes.COMPANY ? (
        companyHours ? (
          <p className="text-sm text-muted-foreground">
            {summarizeCallingHours(companyHours).join(" · ")} · {companyHours.timezone}
          </p>
        ) : null
      ) : (
        <ul className="rounded-xl border border-border">
          {WeekdayFormOptions.map((weekday, index) => {
            const isEnabled = days[index]?.is_enabled ?? false;
            return (
              <li
                key={weekday.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3 last:border-b-0"
              >
                <span className="min-w-0 flex-1 text-sm font-medium sm:w-28 sm:flex-none">{weekday.label}</span>
                <FormField
                  control={form.control}
                  name={`days.${index}.is_enabled`}
                  render={({ field }) => (
                    <Switch
                      aria-label={`Retry on ${weekday.label}`}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {isEnabled ? (
                  <div className="flex w-full items-start gap-2.5 sm:w-auto">
                    <FormField
                      control={form.control}
                      name={`days.${index}.start_time`}
                      render={({ field }) => (
                        <FormItem className="min-w-0 flex-1 sm:w-32 sm:flex-none">
                          <FormControl>
                            <Input type="time" aria-label={`${weekday.label} start`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <span className="pt-1.5 text-sm text-muted-foreground">to</span>
                    <FormField
                      control={form.control}
                      name={`days.${index}.end_time`}
                      render={({ field }) => (
                        <FormItem className="min-w-0 flex-1 sm:w-32 sm:flex-none">
                          <FormControl>
                            <Input type="time" aria-label={`${weekday.label} end`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No retries</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
