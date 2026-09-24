"use client";

import type { FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SectionCard } from "@/components/ui/section-card";
import { Switch } from "@/components/ui/switch";
import { CrmRetryScheduleOptions } from "@/config/constants/dropdowns/alerts/crm-retry-schedule.options";
import { RetryTriggerFormOptions } from "@/config/constants/dropdowns/agents/retry-trigger-form.options";
import { useUpsertAgentRetryRule } from "@/features/agents/hooks/use-agents";
import type { RetryRule } from "@/features/agents/interfaces/agents.interfaces";
import { resizeDelays, toRetryRuleDto, toRetryRuleFormValues } from "@/features/agents/utils/retry-rule-payload.utils";
import { retryRuleSchema, type RetryRuleFormData } from "@/features/agents/validation-schemas/agents.schema";
import type { CallingHours } from "@/features/company/interfaces/company.interfaces";
import { formatDelayMinutes } from "@/views/agents/utils/retry-format";
import { useReportDirty } from "../hooks/use-unsaved-changes";
import { EditSections, type SetSectionDirty } from "../types";
import { EditSaveBar } from "./edit-save-bar";
import { RetryFlowPreview } from "./retry-flow-preview";
import { RetryHoursFields } from "./retry-hours-fields";

const MAX_ATTEMPTS = 10;

interface RetryRuleEditorProps {
  agentId: string;
  rule: RetryRule;
  companyHours: CallingHours | undefined;
  canManage: boolean;
  setSectionDirty: SetSectionDirty;
}

export const RetryRuleEditor: FC<RetryRuleEditorProps> = ({
  agentId,
  rule,
  companyHours,
  canManage,
  setSectionDirty,
}) => {
  const upsertRule = useUpsertAgentRetryRule();
  const form = useForm<RetryRuleFormData>({
    resolver: zodResolver(retryRuleSchema),
    defaultValues: toRetryRuleFormValues(rule, companyHours),
  });
  useReportDirty(EditSections.RETRIES, form.formState.isDirty, setSectionDirty);

  const isEnabled = useWatch({ control: form.control, name: "is_enabled" });
  const maxAttempts = useWatch({ control: form.control, name: "max_attempts" });
  const delays = useWatch({ control: form.control, name: "delays_minutes" });

  const save = form.handleSubmit((values) =>
    upsertRule.mutate(
      { id: agentId, dto: toRetryRuleDto(values, companyHours?.timezone) },
      { onSuccess: (saved) => form.reset(toRetryRuleFormValues(saved, companyHours)) },
    ),
  );

  /** One delay per gap between attempts, so the rows follow the number of attempts as it is typed. */
  const syncDelays = (value: string) => {
    const attempts = Number(value);
    if (!Number.isInteger(attempts) || attempts < 1 || attempts > MAX_ATTEMPTS) return;
    form.setValue("delays_minutes", resizeDelays(form.getValues("delays_minutes"), attempts), { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={save} noValidate className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <SectionCard
            title="Retry rule"
            description="What happens when a call did not go through."
            actions={
              <FormField
                control={form.control}
                name="is_enabled"
                render={({ field }) => (
                  <Switch
                    aria-label="Enable retries"
                    checked={field.value}
                    disabled={!canManage}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            }
          >
            <fieldset disabled={!isEnabled || !canManage} className="flex min-w-0 flex-col gap-6 disabled:opacity-60">
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="max_attempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum attempts</FormLabel>
                      <FormControl>
                        <Input
                          inputMode="numeric"
                          className="w-24"
                          {...field}
                          onChange={(event) => {
                            field.onChange(event);
                            syncDelays(event.target.value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Including the first call.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retry_on"
                  render={({ field }) => (
                    <FormItem>
                      <fieldset className="flex flex-col gap-2.5">
                        <legend className="mb-1 text-sm font-medium">Retry when the call was</legend>
                        {RetryTriggerFormOptions.map((option) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`retry-on-${option.id}`}
                              checked={field.value.includes(option.id)}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  checked ? [...field.value, option.id] : field.value.filter((id) => id !== option.id),
                                )
                              }
                            />
                            <label htmlFor={`retry-on-${option.id}`} className="text-sm">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </fieldset>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {delays.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Delay between attempts</p>
                  {delays.map((delay, index) => {
                    const minutes = Number(delay);
                    return (
                      <FormField
                        key={index}
                        control={form.control}
                        name={`delays_minutes.${index}`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="min-w-0 flex-1 text-sm">Wait after attempt {index + 1}</span>
                              <FormControl>
                                <Input
                                  inputMode="numeric"
                                  className="w-24"
                                  aria-label={`Minutes to wait after attempt ${index + 1}`}
                                  {...field}
                                />
                              </FormControl>
                              <span className="w-32 text-sm text-muted-foreground">
                                minutes
                                {Number.isInteger(minutes) && minutes > 0 ? ` = ${formatDelayMinutes(minutes)}` : ""}
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Allowed calling hours</p>
                <RetryHoursFields form={form} companyHours={companyHours} />
              </div>
            </fieldset>
          </SectionCard>

          <div className="flex flex-col gap-6">
            <SectionCard title="How it plays out" footer="Retries never happen outside allowed calling hours.">
              <RetryFlowPreview isEnabled={isEnabled} maxAttempts={maxAttempts} delays={delays} />
            </SectionCard>
            <SectionCard
              title="Failed CRM updates"
              description="If updating your CRM after a call fails, the platform retries automatically. This schedule is fixed."
            >
              <dl className="flex flex-col divide-y divide-border text-sm">
                {CrmRetryScheduleOptions.map((step) => (
                  <div key={step.id} className="flex justify-between gap-3 py-2 first:pt-0">
                    <dt className="text-muted-foreground">Retry {step.id}</dt>
                    <dd className="font-medium">{step.label}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-3 pt-2">
                  <dt className="text-muted-foreground">Then</dt>
                  <dd className="font-medium">Needs attention</dd>
                </div>
              </dl>
            </SectionCard>
          </div>
        </form>
      </Form>

      <EditSaveBar
        isDirty={form.formState.isDirty}
        isPending={upsertRule.isPending}
        isLive={false}
        onSave={() => void save()}
        onDiscard={() => form.reset(toRetryRuleFormValues(rule, companyHours))}
      />
    </div>
  );
};
