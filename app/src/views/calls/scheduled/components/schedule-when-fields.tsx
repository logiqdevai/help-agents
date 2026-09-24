"use client";

import type { FC } from "react";
import { addDays, format, set } from "date-fns";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getScheduleModeDescription } from "@/config/constants/dropdowns/calls/schedule-mode-description.options";
import { ScheduleModeFormOptions } from "@/config/constants/dropdowns/calls/schedule-mode-form.options";
import { ScheduleModes, type ScheduleMode } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import type { RescheduleCallFormData } from "@/features/scheduled-calls/validation-schemas/scheduled-calls.schema";
import { cn } from "@/lib/utils";

const INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

/** Default for "on a specific date": tomorrow at 10:00. */
export const defaultScheduleDate = () =>
  format(set(addDays(new Date(), 1), { hours: 10, minutes: 0 }), INPUT_FORMAT);

/** The "when should it be called?" block shared by the schedule and reschedule dialogs. */
export const ScheduleWhenFields: FC = () => {
  const form = useFormContext<RescheduleCallFormData>();
  const mode = form.watch("mode");

  return (
    <div className="flex flex-col gap-3">
      <FormField
        control={form.control}
        name="mode"
        render={({ field }) => (
          <FormItem>
            <span className="text-sm font-medium" id="schedule-mode-label">
              When should it be called?
            </span>
            <RadioGroup
              aria-labelledby="schedule-mode-label"
              value={field.value}
              onValueChange={(value) => field.onChange(value as ScheduleMode)}
              className="grid gap-2 sm:grid-cols-2"
            >
              {ScheduleModeFormOptions.map((option) => (
                <Label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-input p-3 font-normal",
                    field.value === option.id && "border-foreground bg-muted/60",
                  )}
                >
                  <RadioGroupItem value={option.id} className="mt-0.5" />
                  <span className="flex flex-col gap-1">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {getScheduleModeDescription(option.id)}
                    </span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />

      {mode === ScheduleModes.AFTER_MINUTES ? (
        <FormField
          control={form.control}
          name="minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minutes from now</FormLabel>
              <FormControl>
                <Input type="number" inputMode="numeric" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}

      {mode === ScheduleModes.DATE ? (
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date and time</FormLabel>
              <FormControl>
                <Input type="datetime-local" min={format(new Date(), INPUT_FORMAT)} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : null}
    </div>
  );
};
