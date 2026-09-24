"use client";

import type { FC } from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlertIcon } from "lucide-react";
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
import { PasswordInput } from "@/components/ui/password-input";
import { useRequestCompanyDeletion } from "@/features/company/hooks/use-company";
import {
  createRequestDeletionSchema,
  type RequestDeletionFormData,
} from "@/features/company/validation-schemas/company.schema";

interface RequestDeletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  gracePeriodDays: number;
}

export const RequestDeletionDialog: FC<RequestDeletionDialogProps> = ({
  open,
  onOpenChange,
  companyName,
  gracePeriodDays,
}) => {
  const requestDeletion = useRequestCompanyDeletion();
  const schema = useMemo(() => createRequestDeletionSchema(companyName), [companyName]);
  const form = useForm<RequestDeletionFormData>({
    resolver: zodResolver(schema),
    defaultValues: { company_name: "", password: "" },
  });

  const handleOpenChange = (next: boolean) => {
    if (requestDeletion.isPending) return;
    if (!next) form.reset();
    onOpenChange(next);
  };

  const onSubmit = (values: RequestDeletionFormData) =>
    requestDeletion.mutate(values, { onSuccess: () => handleOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request account deletion</DialogTitle>
          <DialogDescription>This starts the deletion of all {companyName} data.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div
              role="alert"
              className="flex gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm"
            >
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
              <p>
                <strong className="font-medium">This removes everything.</strong> Agents stop taking calls
                immediately and all data is erased after a {gracePeriodDays}-day grace period.
              </p>
            </div>
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type <span className="font-mono">{companyName}</span> to confirm
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder={companyName} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={requestDeletion.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" variant="destructive" isPending={requestDeletion.isPending}>
                Request deletion
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
