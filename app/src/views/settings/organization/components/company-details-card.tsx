"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getTimezoneOptions } from "@/config/constants/dropdowns/shared/timezone.options";
import { useUpdateCompany } from "@/features/company/hooks/use-company";
import type { Company } from "@/features/company/interfaces/company.interfaces";
import { updateCompanySchema, type UpdateCompanyFormData } from "@/features/company/validation-schemas/company.schema";
import { formatDateTime } from "@/lib/format";
import { SettingsCard } from "../../components/settings-card";

interface CompanyDetailsCardProps {
  company: Company;
  canEdit: boolean;
}

export const CompanyDetailsCard: FC<CompanyDetailsCardProps> = ({ company, canEdit }) => {
  const updateCompany = useUpdateCompany();
  const form = useForm<UpdateCompanyFormData>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company.name,
      website: company.website ?? "",
      phone: company.phone ?? "",
      timezone: company.timezone,
    },
  });

  const onSubmit = (values: UpdateCompanyFormData) =>
    updateCompany.mutate(
      { ...values, website: values.website || null, phone: values.phone || null },
      { onSuccess: () => form.reset(values) },
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <SettingsCard
          title="Company details"
          description="Shown to your team and used for reports and call scheduling."
          footer={
            <>
              <span className="text-sm text-muted-foreground">Last updated {formatDateTime(company.updated_at)}</span>
              {canEdit ? (
                <ActionButtonWithPending
                  type="submit"
                  size="lg"
                  isPending={updateCompany.isPending}
                  disabled={!form.formState.isDirty}
                >
                  Save changes
                </ActionButtonWithPending>
              ) : null}
            </>
          }
        >
          <fieldset disabled={!canEdit} className="grid min-w-0 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Company name</FormLabel>
                  <FormControl>
                    <Input autoComplete="organization" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Website <span className="font-normal text-muted-foreground">Optional</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="url" autoComplete="url" placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className="font-normal text-muted-foreground">Optional</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" placeholder="+30 21 5550 1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Timezone</FormLabel>
                  <FormControl>
                    <NativeSelect className="w-full" {...field}>
                      {getTimezoneOptions(company.timezone).map((option) => (
                        <NativeSelectOption key={option.id} value={option.id}>
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                  <FormDescription>Calling hours below are always interpreted in this timezone.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
        </SettingsCard>
      </form>
    </Form>
  );
};
