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
import { Textarea } from "@/components/ui/textarea";
import { useImportContacts } from "@/features/contacts/hooks/use-contacts";
import {
  importContactsSchema,
  type ImportContactsFormData,
} from "@/views/integrations/detail/validation-schemas/integration-contacts.schema";
import { MaxImportRows, parseContactLines } from "@/views/integrations/detail/utils/contact-import.utils";

interface ImportContactsDialogProps {
  integrationId: string;
  integrationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: ImportContactsFormData = { rows: "", default_country: "" };

export const ImportContactsDialog: FC<ImportContactsDialogProps> = ({
  integrationId,
  integrationName,
  open,
  onOpenChange,
}) => {
  const importContacts = useImportContacts();
  const form = useForm<ImportContactsFormData>({
    resolver: zodResolver(importContactsSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) form.reset(emptyValues);
  }, [open, form]);

  const submit = form.handleSubmit(async (values) => {
    const result = await importContacts
      .mutateAsync({
        contacts: parseContactLines(values.rows).map((contact) => ({ ...contact, integration_uuid: integrationId })),
        ...(values.default_country ? { default_country: values.default_country.toUpperCase() } : {}),
      })
      .catch(() => null);
    if (result) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={(next) => !importContacts.isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import contacts</DialogTitle>
          <DialogDescription>
            Add people to call and link them to {integrationName}. Contacts you already have are updated instead of
            duplicated.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="rows"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacts</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
                      spellCheck={false}
                      className="font-mono text-xs"
                      placeholder={"Maria Papadopoulou, +30 697 555 0118, maria.p@example.com\nDimitris Kostas, +30 694 555 0132"}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    One contact per line: name, phone, email. Up to {MaxImportRows} at a time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="default_country"
              render={({ field }) => (
                <FormItem className="sm:max-w-40">
                  <FormLabel>
                    Country <span className="font-normal text-muted-foreground">Optional</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="GR" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={importContacts.isPending}>
                Import contacts
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
