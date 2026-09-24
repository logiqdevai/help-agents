"use client";

import type { FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WeekdayFormOptions, getWeekdayLabel } from "@/config/constants/dropdowns/company/weekday.options";
import { useSetCallingHours } from "@/features/company/hooks/use-company";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";
import { callingHoursSchema, type CallingHoursFormData } from "@/features/company/validation-schemas/company.schema";
import { SettingsCard } from "../../components/settings-card";

interface CallingHoursCardProps {
  hours: CallingHours;
  canEdit: boolean;
}

const toFormValues = (hours: CallingHours): CallingHoursFormData => ({
  days: WeekdayFormOptions.map(({ id }) => {
    const day = hours.days.find((d) => d.day_of_week === id);
    return {
      day_of_week: id,
      is_enabled: day?.is_enabled ?? false,
      start_time: day?.start_time ?? "09:00",
      end_time: day?.end_time ?? "18:00",
    };
  }),
});

export const CallingHoursCard: FC<CallingHoursCardProps> = ({ hours, canEdit }) => {
  const setCallingHours = useSetCallingHours();
  const form = useForm<CallingHoursFormData>({
    resolver: zodResolver(callingHoursSchema),
    defaultValues: toFormValues(hours),
  });
  const days = useWatch({ control: form.control, name: "days" });

  const onSubmit = (values: CallingHoursFormData) =>
    setCallingHours.mutate({ days: values.days }, { onSuccess: () => form.reset(values) });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <SettingsCard
          title="Calling hours"
          description={`Agents only place automated calls inside these windows, in ${hours.timezone} time.`}
          flush
          footer={
            <>
              <span className="text-sm text-muted-foreground">
                Retry rules on each agent can narrow these hours, never widen them.
              </span>
              {canEdit ? (
                <ActionButtonWithPending
                  type="submit"
                  variant="outline"
                  size="lg"
                  isPending={setCallingHours.isPending}
                  disabled={!form.formState.isDirty}
                >
                  Save hours
                </ActionButtonWithPending>
              ) : null}
            </>
          }
        >
          <fieldset disabled={!canEdit} className="min-w-0">
            <div
              aria-hidden
              className="hidden items-center gap-4 border-b border-border px-6 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase sm:flex"
            >
              <span className="w-32 shrink-0">Day</span>
              <span className="w-24 shrink-0">Allowed</span>
              <span>Window</span>
            </div>
            <ul>
              {WeekdayFormOptions.map((weekday, index) => {
                const isEnabled = days?.[index]?.is_enabled ?? false;
                const label = getWeekdayLabel(weekday.id);
                return (
                  <li
                    key={weekday.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 px-5 py-3 last:border-b-0 sm:min-h-16 sm:flex-nowrap sm:px-6"
                  >
                    <span className="min-w-0 flex-1 font-medium sm:w-32 sm:flex-none sm:shrink-0">{label}</span>
                    <div className="sm:w-24 sm:shrink-0">
                      <FormField
                        control={form.control}
                        name={`days.${index}.is_enabled`}
                        render={({ field }) => (
                          <Switch
                            aria-label={`Allow calls on ${label}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onBlur={field.onBlur}
                          />
                        )}
                      />
                    </div>
                    {isEnabled ? (
                      <div className="flex w-full items-start gap-2.5 sm:w-auto">
                        <FormField
                          control={form.control}
                          name={`days.${index}.start_time`}
                          render={({ field }) => (
                            <FormItem className="min-w-0 flex-1 sm:w-36 sm:flex-none">
                              <FormControl>
                                <Input type="time" aria-label={`${label} start`} {...field} />
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
                            <FormItem className="min-w-0 flex-1 sm:w-36 sm:flex-none">
                              <FormControl>
                                <Input type="time" aria-label={`${label} end`} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <span className="w-full text-sm text-muted-foreground sm:w-auto">No calling</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </fieldset>
        </SettingsCard>
      </form>
    </Form>
  );
};
