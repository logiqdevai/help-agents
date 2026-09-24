"use client";

import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateIntegration } from "@/features/integrations/hooks/use-integrations";
import { CustomProviders, type Integration } from "@/features/integrations/interfaces/integrations.interfaces";
import {
  editIntegrationSchema,
  type EditIntegrationFormData,
} from "@/features/integrations/validation-schemas/integrations.schema";

interface EditConnectionDialogProps {
  integration: Integration;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toFormValues = (integration: Integration): EditIntegrationFormData => ({
  name: integration.name,
  base_url: integration.base_url ?? "",
  api_docs_url: integration.api_docs_url ?? "",
});

export const EditConnectionDialog: FC<EditConnectionDialogProps> = ({ integration, open, onOpenChange }) => {
  const updateIntegration = useUpdateIntegration();
  const isCustom = CustomProviders.includes(integration.provider);
  const form = useForm<EditIntegrationFormData>({
    resolver: zodResolver(editIntegrationSchema),
    defaultValues: toFormValues(integration),
  });

  useEffect(() => {
    if (open) form.reset(toFormValues(integration));
  }, [open, integration, form]);

  const submit = form.handleSubmit(async (values) => {
    const saved = await updateIntegration
      .mutateAsync({
        id: integration.id,
        dto: {
          name: values.name,
          ...(isCustom && values.base_url ? { base_url: values.base_url } : {}),
          ...(isCustom ? { api_docs_url: values.api_docs_url || null } : {}),
        },
      })
      .catch(() => null);
    if (saved) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !updateIntegration.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit connection</DialogTitle>
          <DialogDescription>Rename this connection{isCustom ? " or change its address." : "."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isCustom ? (
              <>
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
                <FormField
                  control={form.control}
                  name="api_docs_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Link to API documentation <span className="font-normal text-muted-foreground">Optional</span>
                      </FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={updateIntegration.isPending}>
                Save changes
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
