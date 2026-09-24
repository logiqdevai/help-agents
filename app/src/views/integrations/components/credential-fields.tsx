"use client";

import type { FC } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { SelectField } from "@/components/ui/select-field";
import { ApiKeyPlacementFormOptions } from "@/config/constants/dropdowns/integrations/api-key-placement-form.options";
import {
  ApiKeyPlacements,
  IntegrationAuthTypes,
  type ApiKeyPlacement,
} from "@/features/integrations/interfaces/integrations.interfaces";
import type { CredentialsFormData } from "@/features/integrations/validation-schemas/integrations.schema";
import { DefaultApiKeyHeader, DefaultApiKeyQueryParam } from "@/features/integrations/utils/integration-payload.utils";

/** Secret inputs for the chosen auth type. Must render inside a form whose values include the credential fields. */
export const CredentialFields: FC = () => {
  const { control } = useFormContext<CredentialsFormData>();
  const authType = useWatch({ control, name: "auth_type" });

  switch (authType) {
    case IntegrationAuthTypes.API_KEY:
      return <ApiKeyFields />;
    case IntegrationAuthTypes.BEARER_TOKEN:
      return <BearerTokenFields />;
    case IntegrationAuthTypes.BASIC:
      return <BasicFields />;
    case IntegrationAuthTypes.OAUTH2:
      return <OAuth2Fields />;
    case IntegrationAuthTypes.CUSTOM_HEADERS:
      return <CustomHeadersFields />;
  }
};

const ApiKeyFields: FC = () => {
  const { control, setValue, getValues } = useFormContext<CredentialsFormData>();
  const placement = useWatch({ control, name: "placement" });

  const changePlacement = (next: ApiKeyPlacement) => {
    setValue("placement", next, { shouldDirty: true });
    // Swap the suggested name only while it is still one of the two defaults.
    const current = getValues("key_name");
    if (current === DefaultApiKeyHeader || current === DefaultApiKeyQueryParam) {
      setValue(
        "key_name",
        next === ApiKeyPlacements.QUERY ? DefaultApiKeyQueryParam : DefaultApiKeyHeader,
        { shouldDirty: true },
      );
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="api_key"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>API key</FormLabel>
            <FormControl>
              <PasswordInput autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="placement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Send it in</FormLabel>
            <FormControl>
              <SelectField
                className="w-full"
                value={field.value}
                onValueChange={changePlacement}
                options={ApiKeyPlacementFormOptions}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="key_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{placement === ApiKeyPlacements.QUERY ? "Parameter name" : "Header name"}</FormLabel>
            <FormControl>
              <Input autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const BearerTokenFields: FC = () => {
  const { control } = useFormContext<CredentialsFormData>();
  return (
    <FormField
      control={control}
      name="token"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bearer token</FormLabel>
          <FormControl>
            <PasswordInput autoComplete="off" placeholder="Paste your token" {...field} />
          </FormControl>
          <FormDescription>
            Sent as <span className="font-mono text-xs">Authorization: Bearer …</span>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const BasicFields: FC = () => {
  const { control } = useFormContext<CredentialsFormData>();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <PasswordInput autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const OAuth2Fields: FC = () => {
  const { control } = useFormContext<CredentialsFormData>();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        control={control}
        name="client_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client ID</FormLabel>
            <FormControl>
              <Input autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="client_secret"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Client secret</FormLabel>
            <FormControl>
              <PasswordInput autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="token_url"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>Token URL</FormLabel>
            <FormControl>
              <Input type="url" placeholder="https://" autoComplete="off" {...field} />
            </FormControl>
            <FormDescription>The address where your system issues access tokens.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="scope"
        render={({ field }) => (
          <FormItem className="sm:col-span-2">
            <FormLabel>
              Scopes <span className="font-normal text-muted-foreground">Optional</span>
            </FormLabel>
            <FormControl>
              <Input placeholder="contacts.read contacts.write" autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const CustomHeadersFields: FC = () => {
  const { control } = useFormContext<CredentialsFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "headers" });

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">Custom headers</span>
      {fields.map((row, index) => (
        <div key={row.id} className="grid grid-cols-[1fr_auto] items-start gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <FormField
            control={control}
            name={`headers.${index}.name`}
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormControl>
                  <Input placeholder="Header name" aria-label="Header name" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`headers.${index}.value`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput placeholder="Value" aria-label="Header value" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove header"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            <XIcon />
          </Button>
        </div>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", value: "" })}>
          <PlusIcon />
          Add header
        </Button>
      </div>
    </div>
  );
};
