"use client";

import { useState, type FC } from "react";
import Link from "next/link";
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
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCallAgentOptions } from "@/features/calls/hooks/use-calls";
import { useCreateScheduledCall } from "@/features/scheduled-calls/hooks/use-scheduled-calls";
import { ScheduleModes } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { toScheduleWhen } from "@/features/scheduled-calls/utils/scheduled-calls.utils";
import {
  scheduleCallSchema,
  type ScheduleCallFormData,
} from "@/features/scheduled-calls/validation-schemas/scheduled-calls.schema";
import { Routes } from "@/routes/routes";
import { ContactPicker, type PickedContact } from "@/views/calls/components/contact-picker";
import { CallingHoursNotice } from "./calling-hours-notice";
import { defaultScheduleDate, ScheduleWhenFields } from "./schedule-when-fields";

export interface ScheduleCallDefaults {
  agent_uuid?: string;
  contact?: PickedContact;
}

interface ScheduleCallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults?: ScheduleCallDefaults;
}

const ScheduleCallForm: FC<Pick<ScheduleCallDialogProps, "onOpenChange" | "defaults">> = ({
  onOpenChange,
  defaults,
}) => {
  const agents = useGetCallAgentOptions(true);
  const createScheduledCall = useCreateScheduledCall();
  const [contact, setContact] = useState<PickedContact | null>(defaults?.contact ?? null);

  const form = useForm<ScheduleCallFormData>({
    resolver: zodResolver(scheduleCallSchema),
    defaultValues: {
      agent_uuid: defaults?.agent_uuid ?? "",
      contact_uuid: defaults?.contact?.id ?? "",
      name: "",
      phone: "",
      mode: ScheduleModes.IMMEDIATELY,
      minutes: "30",
      date: defaultScheduleDate(),
    },
  });

  const handleContactChange = (next: PickedContact | null) => {
    setContact(next);
    form.setValue("contact_uuid", next?.id ?? "");
    if (next) {
      form.setValue("name", "");
      form.setValue("phone", "");
      form.clearErrors("phone");
    }
  };

  const onSubmit = (values: ScheduleCallFormData) =>
    createScheduledCall.mutate(
      {
        agent_uuid: values.agent_uuid,
        ...(values.contact_uuid
          ? { contact_uuid: values.contact_uuid }
          : { contact: { name: values.name || undefined, phone: values.phone } }),
        when: toScheduleWhen(values),
      },
      { onSuccess: () => onOpenChange(false) },
    );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid content-start gap-2">
            <Label htmlFor="schedule-contact">Contact</Label>
            <ContactPicker id="schedule-contact" value={contact} onChange={handleContactChange} />
          </div>
          <FormField
            control={form.control}
            name="agent_uuid"
            render={({ field }) => (
              <FormItem className="content-start">
                <FormLabel>Agent</FormLabel>
                {agents.isPending ? (
                  <Skeleton className="h-8 w-full" />
                ) : agents.isError ? (
                  <div className="flex items-center justify-between gap-2 text-sm text-destructive">
                    <span>{agents.error.message}</span>
                    <Button type="button" variant="outline" size="sm" onClick={() => agents.refetch()}>
                      Try again
                    </Button>
                  </div>
                ) : agents.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Only active agents can be scheduled.{" "}
                    <Link href={Routes.agents.root} className="text-foreground underline underline-offset-4">
                      Go to Agents
                    </Link>
                  </p>
                ) : (
                  <FormControl>
                    <NativeSelect className="w-full" {...field}>
                      <NativeSelectOption value="">Choose an agent</NativeSelectOption>
                      {agents.data.map((agent) => (
                        <NativeSelectOption key={agent.id} value={agent.id}>
                          {agent.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!contact ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New contact name <span className="font-normal text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="Maria Papadopoulou" {...field} />
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
                  <FormLabel>Or a new phone number</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="off" placeholder="+30 697 555 0114" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : null}

        <ScheduleWhenFields />

        <CallingHoursNotice />

        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" disabled={createScheduledCall.isPending} />}
          >
            Cancel
          </DialogClose>
          <ActionButtonWithPending type="submit" isPending={createScheduledCall.isPending}>
            Schedule call
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

/** Schedule a call for a contact (existing or a new number) with an active agent. */
export const ScheduleCallDialog: FC<ScheduleCallDialogProps> = ({ open, onOpenChange, defaults }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Schedule a call</DialogTitle>
        <DialogDescription>Choose who to call, with which agent, and when.</DialogDescription>
      </DialogHeader>
      <ScheduleCallForm onOpenChange={onOpenChange} defaults={defaults} />
    </DialogContent>
  </Dialog>
);
