"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SelectField } from "@/components/ui/select-field";
import { getRecordingRetentionOptions } from "@/config/constants/dropdowns/company/recording-retention-form.options";
import { useUpdateCompany } from "@/features/company/hooks/use-company";
import type { Company } from "@/features/company/interfaces/company.interfaces";
import {
  recordingRetentionSchema,
  type RecordingRetentionFormData,
} from "@/features/company/validation-schemas/company.schema";
import { SettingsCard } from "../../components/settings-card";

interface RecordingRetentionCardProps {
  company: Company;
  canEdit: boolean;
}

const FOREVER = "forever";

const toSelectValue = (days: number | null): string => (days === null ? FOREVER : String(days));

export const RecordingRetentionCard: FC<RecordingRetentionCardProps> = ({ company, canEdit }) => {
  const updateCompany = useUpdateCompany();
  const form = useForm<RecordingRetentionFormData>({
    resolver: zodResolver(recordingRetentionSchema),
    defaultValues: { retention: toSelectValue(company.recording_retention_days) },
  });

  const onSubmit = (values: RecordingRetentionFormData) =>
    updateCompany.mutate(
      { recording_retention_days: values.retention === FOREVER ? null : Number(values.retention) },
      { onSuccess: () => form.reset(values) },
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <SettingsCard
          title="Call recordings"
          description="Where supported and legally allowed, calls are recorded for playback."
          footer={
            <>
              <span className="text-sm text-muted-foreground">Applies to the whole company.</span>
              {canEdit ? (
                <ActionButtonWithPending
                  type="submit"
                  variant="outline"
                  size="lg"
                  isPending={updateCompany.isPending}
                  disabled={!form.formState.isDirty}
                >
                  Save retention
                </ActionButtonWithPending>
              ) : null}
            </>
          }
        >
          <FormField
            control={form.control}
            name="retention"
            render={({ field }) => (
              <FormItem className="max-w-sm">
                <FormLabel>Keep recordings for</FormLabel>
                <FormControl>
                  <SelectField
                    className="w-full"
                    disabled={!canEdit}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    options={getRecordingRetentionOptions(company.recording_retention_days).map((option) => ({
                      id: toSelectValue(option.id),
                      label: option.label,
                    }))}
                  />
                </FormControl>
                <FormDescription>
                  Applies to calls recorded from now on. Deleted recordings cannot be recovered.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsCard>
      </form>
    </Form>
  );
};
