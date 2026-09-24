"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdatePhoneNumber } from "@/features/phone-numbers/hooks/use-phone-numbers";
import type { PhoneNumber } from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import {
  phoneNumberLabelSchema,
  type PhoneNumberLabelFormData,
} from "@/features/phone-numbers/validation-schemas/phone-numbers.schema";

interface EditLabelFormProps {
  phone: PhoneNumber;
  onDone: () => void;
}

const EditLabelForm: FC<EditLabelFormProps> = ({ phone, onDone }) => {
  const update = useUpdatePhoneNumber();
  const form = useForm<PhoneNumberLabelFormData>({
    resolver: zodResolver(phoneNumberLabelSchema),
    defaultValues: { label: phone.label ?? "" },
  });

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) =>
          update.mutate({ id: phone.id, dto: { label: values.label } }, { onSuccess: onDone }),
        )}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Main outbound line" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <ActionButtonWithPending type="submit" isPending={update.isPending}>
            Save label
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface EditLabelDialogProps {
  /** The number being edited; null keeps the dialog closed. */
  phone: PhoneNumber | null;
  onClose: () => void;
}

export const EditLabelDialog: FC<EditLabelDialogProps> = ({ phone, onClose }) => (
  <Dialog open={phone !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg">Edit label</DialogTitle>
        <DialogDescription>Labels are just for your team. Customers never see them.</DialogDescription>
      </DialogHeader>
      {phone ? <EditLabelForm phone={phone} onDone={onClose} /> : null}
    </DialogContent>
  </Dialog>
);
