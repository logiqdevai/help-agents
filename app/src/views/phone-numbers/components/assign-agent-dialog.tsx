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
import { ErrorState } from "@/components/ui/error-state";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SelectField } from "@/components/ui/select-field";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAgentOptions } from "@/features/phone-numbers/hooks/use-agent-options";
import { useAssignPhoneNumberAgent } from "@/features/phone-numbers/hooks/use-phone-numbers";
import type { PhoneNumber } from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import {
  assignPhoneNumberAgentSchema,
  type AssignPhoneNumberAgentFormData,
} from "@/features/phone-numbers/validation-schemas/phone-numbers.schema";

interface AssignAgentFormProps {
  phone: PhoneNumber;
  onDone: () => void;
}

const AssignAgentForm: FC<AssignAgentFormProps> = ({ phone, onDone }) => {
  const agents = useGetAgentOptions();
  const assign = useAssignPhoneNumberAgent();
  const form = useForm<AssignPhoneNumberAgentFormData>({
    resolver: zodResolver(assignPhoneNumberAgentSchema),
    defaultValues: { agent_uuid: phone.agent?.id ?? "" },
  });

  if (agents.isPending) return <Skeleton className="h-9 w-full" />;
  if (agents.isError) {
    return <ErrorState title="Could not load agents" message={agents.error.message} onRetry={() => agents.refetch()} />;
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit((values) =>
          assign.mutate({ id: phone.id, agent_uuid: values.agent_uuid }, { onSuccess: onDone }),
        )}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="agent_uuid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <FormControl>
                <SelectField
                  className="w-full"
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  options={[
                    { id: "", label: "Choose an agent", disabled: true },
                    ...agents.data.map((agent) => ({ id: agent.id, label: agent.name })),
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <ActionButtonWithPending type="submit" isPending={assign.isPending}>
            Assign agent
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

interface AssignAgentDialogProps {
  /** The number being assigned; null keeps the dialog closed. */
  phone: PhoneNumber | null;
  onClose: () => void;
}

export const AssignAgentDialog: FC<AssignAgentDialogProps> = ({ phone, onClose }) => (
  <Dialog open={phone !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="text-lg">Assign an agent</DialogTitle>
        <DialogDescription>
          {phone ? `The agent you choose answers and calls on ${phone.number}.` : null}
        </DialogDescription>
      </DialogHeader>
      {phone ? <AssignAgentForm phone={phone} onDone={onClose} /> : null}
    </DialogContent>
  </Dialog>
);
