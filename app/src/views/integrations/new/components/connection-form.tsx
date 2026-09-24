"use client";

import type { FC } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, ZapIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateIntegration } from "@/features/integrations/hooks/use-integrations";
import {
  CustomProviders,
  type Integration,
  type IntegrationAuthType,
  type ProviderInfo,
} from "@/features/integrations/interfaces/integrations.interfaces";
import {
  CredentialFormDefaults,
  getManualAuthTypes,
  toCreateIntegrationDto,
} from "@/features/integrations/utils/integration-payload.utils";
import {
  connectionFormSchema,
  type ConnectionFormData,
} from "@/features/integrations/validation-schemas/integrations.schema";
import { Routes } from "@/routes/routes";
import { AuthTypeSelector } from "../../components/auth-type-selector";
import { CredentialFields } from "../../components/credential-fields";

interface ConnectionFormProps {
  provider: ProviderInfo;
  canManage: boolean;
  onCreated: (integration: Integration) => void;
}

export const ConnectionForm: FC<ConnectionFormProps> = ({ provider, canManage, onCreated }) => {
  const createIntegration = useCreateIntegration();
  const authTypes = getManualAuthTypes(provider);
  const isCustom = CustomProviders.includes(provider.provider);

  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: isCustom ? "" : provider.display_name,
      provider: provider.provider as ConnectionFormData["provider"],
      base_url: "",
      api_docs_url: "",
      ...CredentialFormDefaults[authTypes[0]],
    },
  });
  const authType = useWatch({ control: form.control, name: "auth_type" });

  const changeAuthType = (next: IntegrationAuthType) => {
    const { name, provider: selected, base_url, api_docs_url } = form.getValues();
    form.reset({ name, provider: selected, base_url, api_docs_url, ...CredentialFormDefaults[next] });
  };

  const submit = form.handleSubmit(async (values) => {
    const integration = await createIntegration.mutateAsync(toCreateIntegrationDto(values)).catch(() => null);
    if (integration) onCreated(integration);
  });

  return (
    <Form {...form}>
      <form onSubmit={submit} noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Connection details</CardTitle>
            <CardDescription>
              Everything here is used only by our servers. Nothing is ever exposed in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isCustom ? "CRM name" : "Connection name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Aegean CRM" {...field} />
                    </FormControl>
                    <FormDescription>Shown to your team when choosing a CRM for an agent.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {provider.requires_base_url ? (
                <FormField
                  control={form.control}
                  name="base_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Web address (base URL)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              {isCustom ? (
                <FormField
                  control={form.control}
                  name="api_docs_url"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Link to API documentation <span className="font-normal text-muted-foreground">Optional</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://" {...field} />
                      </FormControl>
                      <FormDescription>Helps your team when defining which tools the CRM offers.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            {authTypes.length > 1 ? (
              <AuthTypeSelector value={authType} allowed={authTypes} onChange={changeAuthType} />
            ) : null}

            <CredentialFields />

            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
              <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-body">
                <b className="font-medium text-foreground">Keys are stored encrypted and never shown again.</b> After
                saving, you will only see a masked hint like <span className="font-mono text-xs">••••abcd</span>. To
                change a key later, you enter a new one.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-wrap justify-end gap-2">
            <Link href={Routes.integrations.root} className={buttonVariants({ variant: "ghost" })}>
              Cancel
            </Link>
            <ActionButtonWithPending
              type="submit"
              disabled={!canManage}
              isPending={createIntegration.isPending}
            >
              <ZapIcon />
              Save and test connection
            </ActionButtonWithPending>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
