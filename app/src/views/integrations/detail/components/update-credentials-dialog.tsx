"use client";

import { useEffect, type FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { getIntegrationAuthTypeLabel } from "@/config/constants/dropdowns/integrations/integration-auth-type-form.options";
import { useUpdateIntegration } from "@/features/integrations/hooks/use-integrations";
import {
  IntegrationStatuses,
  type Integration,
  type IntegrationAuthType,
} from "@/features/integrations/interfaces/integrations.interfaces";
import { CredentialFormDefaults, toCredentialsDto } from "@/features/integrations/utils/integration-payload.utils";
import {
  credentialsFormSchema,
  type CredentialsFormData,
} from "@/features/integrations/validation-schemas/integrations.schema";
import { AuthTypeSelector } from "../../components/auth-type-selector";
import { CredentialFields } from "../../components/credential-fields";

interface UpdateCredentialsDialogProps {
  integration: Integration;
  /** Auth types the provider accepts when entering secrets by hand. */
  authTypes: IntegrationAuthType[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialValues = (integration: Integration, authTypes: IntegrationAuthType[]): CredentialsFormData => {
  const current = integration.auth_type && authTypes.includes(integration.auth_type) ? integration.auth_type : authTypes[0];
  return CredentialFormDefaults[current];
};

/** Secrets are write-only: the dialog never shows the stored value, only the masked hint, and always saves a new one. */
export const UpdateCredentialsDialog: FC<UpdateCredentialsDialogProps> = ({
  integration,
  authTypes,
  open,
  onOpenChange,
}) => {
  const updateIntegration = useUpdateIntegration();
  const form = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: initialValues(integration, authTypes),
  });
  const authType = useWatch({ control: form.control, name: "auth_type" });

  useEffect(() => {
    if (open) form.reset(initialValues(integration, authTypes));
  }, [open, integration, authTypes, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await updateIntegration
      .mutateAsync({ id: integration.id, dto: toCredentialsDto(values) })
      .catch(() => null);
    if (saved) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !updateIntegration.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update credentials</DialogTitle>
          <DialogDescription>
            For security, the current secret is never shown. Enter new details to replace it. The connection is tested
            right after saving.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
            {integration.credentials_hint ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Current secret</span>
                <div className="flex h-8 items-center rounded-lg border border-input bg-muted px-2.5 font-mono text-sm tracking-wider">
                  {integration.credentials_hint}
                </div>
              </div>
            ) : null}
            {authTypes.length > 1 ? (
              <AuthTypeSelector
                value={authType}
                allowed={authTypes}
                onChange={(next) => form.reset(CredentialFormDefaults[next])}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Authentication: {getIntegrationAuthTypeLabel(authTypes[0])}
              </p>
            )}
            {integration.status === IntegrationStatuses.ERROR && integration.last_error ? (
              <p role="alert" className="text-sm text-destructive">
                The last attempt failed: {integration.last_error}
              </p>
            ) : null}
            <CredentialFields />
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm">
              <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-body">
                Stored encrypted. Once saved, only a masked hint like{" "}
                <span className="font-mono text-xs">••••abcd</span> is ever shown.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={updateIntegration.isPending}>
                Save and test
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
