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
import { Form } from "@/components/ui/form";
import { useRescheduleScheduledCall } from "@/features/scheduled-calls/hooks/use-scheduled-calls";
import { ScheduleModes, type ScheduledCall } from "@/features/scheduled-calls/interfaces/scheduled-calls.interfaces";
import { toScheduleWhen } from "@/features/scheduled-calls/utils/scheduled-calls.utils";
import {
  rescheduleCallSchema,
  type RescheduleCallFormData,
} from "@/features/scheduled-calls/validation-schemas/scheduled-calls.schema";
import { CallingHoursNotice } from "./calling-hours-notice";
import { defaultScheduleDate, ScheduleWhenFields } from "./schedule-when-fields";

interface RescheduleCallDialogProps {
  /** The pending call being changed; the dialog is open while this is set. */
  scheduledCall: ScheduledCall | null;
  onClose: () => void;
}

const RescheduleCallForm: FC<{ scheduledCall: ScheduledCall; onClose: () => void }> = ({
  scheduledCall,
  onClose,
}) => {
  const reschedule = useRescheduleScheduledCall();
  const form = useForm<RescheduleCallFormData>({
    resolver: zodResolver(rescheduleCallSchema),
    defaultValues: { mode: ScheduleModes.DATE, minutes: "30", date: defaultScheduleDate() },
  });

  const onSubmit = (values: RescheduleCallFormData) =>
    reschedule.mutate({ id: scheduledCall.id, dto: { when: toScheduleWhen(values) } }, { onSuccess: onClose });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <ScheduleWhenFields />
        <CallingHoursNotice />
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={reschedule.isPending} />}>
            Cancel
          </DialogClose>
          <ActionButtonWithPending type="submit" isPending={reschedule.isPending}>
            Reschedule
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

/** Change when a pending scheduled call is placed. */
export const RescheduleCallDialog: FC<RescheduleCallDialogProps> = ({ scheduledCall, onClose }) => (
  <Dialog open={scheduledCall !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
      {scheduledCall ? (
        <>
          <DialogHeader>
            <DialogTitle>Reschedule call</DialogTitle>
            <DialogDescription>
              {scheduledCall.contact.name ?? scheduledCall.contact.phone ?? "This contact"} ·{" "}
              {scheduledCall.agent.name}
            </DialogDescription>
          </DialogHeader>
          <RescheduleCallForm scheduledCall={scheduledCall} onClose={onClose} />
        </>
      ) : null}
    </DialogContent>
  </Dialog>
);
