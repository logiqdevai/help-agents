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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { CrmRecordTypeFormOptions } from "@/config/constants/dropdowns/integrations/crm-record-type-form.options";
import { useSyncContactFromCrm } from "@/features/contacts/hooks/use-contacts";
import { CrmRecordTypes } from "@/features/contacts/interfaces/contacts.interfaces";
import {
  syncContactSchema,
  type SyncContactFormData,
} from "@/views/integrations/detail/validation-schemas/integration-contacts.schema";

interface SyncContactDialogProps {
  integrationId: string;
  integrationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: SyncContactFormData = {
  external_id: "",
  phone: "",
  email: "",
  record_type: CrmRecordTypes.CONTACT,
  default_country: "",
};

export const SyncContactDialog: FC<SyncContactDialogProps> = ({
  integrationId,
  integrationName,
  open,
  onOpenChange,
}) => {
  const syncContact = useSyncContactFromCrm();
  const form = useForm<SyncContactFormData>({ resolver: zodResolver(syncContactSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const submit = form.handleSubmit(async (values) => {
    const synced = await syncContact
      .mutateAsync({
        integration_uuid: integrationId,
        record_type: values.record_type,
        ...(values.external_id ? { external_id: values.external_id } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.email ? { email: values.email } : {}),
        ...(values.default_country ? { default_country: values.default_country.toUpperCase() } : {}),
      })
      .catch(() => null);
    if (synced) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !syncContact.isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync a contact from {integrationName}</DialogTitle>
          <DialogDescription>
            We look the record up in your CRM and keep a light copy so agents can call it. Enter any one of the details
            below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="external_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CRM reference</FormLabel>
                  <FormControl>
                    <Input className="font-mono" placeholder="CNT-20418" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+30 697 555 0118" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="maria@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="record_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record type</FormLabel>
                    <FormControl>
                      <NativeSelect className="w-full" {...field}>
                        {CrmRecordTypeFormOptions.map((option) => (
                          <NativeSelectOption key={option.id} value={option.id}>
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country <span className="font-normal text-muted-foreground">Optional</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="GR" maxLength={2} {...field} />
                    </FormControl>
                    <FormDescription>For phone numbers written without a country code.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={syncContact.isPending}>
                Sync contact
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
