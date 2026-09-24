"use client";

import { useEffect, type FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";
import { Textarea } from "@/components/ui/textarea";
import { CrmEndpointFormOptions } from "@/config/constants/dropdowns/integrations/crm-endpoint-form.options";
import { HttpMethodFormOptions } from "@/config/constants/dropdowns/integrations/http-method-form.options";
import { useUpdateIntegration } from "@/features/integrations/hooks/use-integrations";
import type { Integration } from "@/features/integrations/interfaces/integrations.interfaces";
import {
  toCrmEndpointsFormValues,
  toGenericApiConfig,
} from "@/features/integrations/utils/crm-endpoints-payload.utils";
import {
  crmEndpointsFormSchema,
  type CrmEndpointsFormData,
} from "@/features/integrations/validation-schemas/crm-endpoints.schema";

interface CrmEndpointsCardProps {
  integration: Integration;
  canManage: boolean;
}

/** How the platform talks to a customer-defined CRM: one templated HTTP call per standard action. */
export const CrmEndpointsCard: FC<CrmEndpointsCardProps> = ({ integration, canManage }) => {
  const updateIntegration = useUpdateIntegration();
  const form = useForm<CrmEndpointsFormData>({
    resolver: zodResolver(crmEndpointsFormSchema),
    defaultValues: toCrmEndpointsFormValues(integration.config),
  });
  const { fields } = useFieldArray({ control: form.control, name: "endpoints" });

  useEffect(() => {
    form.reset(toCrmEndpointsFormValues(integration.config));
  }, [integration.config, form]);

  const submit = form.handleSubmit((values) =>
    updateIntegration
      .mutateAsync({ id: integration.id, dto: { config: toGenericApiConfig(values) } })
      .catch(() => undefined),
  );

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Standard endpoints</CardTitle>
            <CardDescription>
              Tell us which address to call for each standard action, so agents can identify people and record call
              results. Leave the path empty for actions your system does not support.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {fields.map((row, index) => {
              const option = CrmEndpointFormOptions.find((o) => o.id === row.key);
              return (
                <fieldset key={row.id} disabled={!canManage} className="flex flex-col gap-2 border-t border-border pt-4 first:border-t-0 first:pt-0">
                  <legend className="sr-only">{option?.label}</legend>
                  <div>
                    <b className="font-medium text-foreground">{option?.label}</b>
                    <p className="text-sm text-muted-foreground">{option?.description}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[120px_1fr]">
                    <FormField
                      control={form.control}
                      name={`endpoints.${index}.method`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <SelectField
                              className="w-full"
                              aria-label={`${option?.label} method`}
                              name={field.name}
                              value={field.value}
                              onValueChange={field.onChange}
                              onBlur={field.onBlur}
                              ref={field.ref}
                              options={HttpMethodFormOptions}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`endpoints.${index}.path`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="font-mono"
                              placeholder="/contacts/search?phone={phone}"
                              aria-label={`${option?.label} path`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`endpoints.${index}.extra`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            className="font-mono text-xs"
                            rows={2}
                            spellCheck={false}
                            placeholder={`Optional JSON: query, body, result paths. Available values: ${option?.placeholders}`}
                            aria-label={`${option?.label} additional settings`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
              );
            })}
          </CardContent>
          {canManage ? (
            <CardFooter className="justify-between gap-3">
              <span className="text-sm text-muted-foreground">Saving tests the connection again.</span>
              <ActionButtonWithPending type="submit" isPending={updateIntegration.isPending}>
                Save endpoints
              </ActionButtonWithPending>
            </CardFooter>
          ) : null}
        </Card>
      </form>
    </Form>
  );
};
