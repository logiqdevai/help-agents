"use client";

import type { FC } from "react";
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
import { SelectField } from "@/components/ui/select-field";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import { CompanyRoles, type CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import { useCreateInvitation } from "@/features/team/hooks/use-team";
import { createInvitationSchema, type CreateInvitationFormData } from "@/features/team/validation-schemas/team.schema";
import { canManageRole } from "@/features/team/utils/team-policy.utils";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
  myRole: CompanyRole | undefined;
}

export const InviteMemberDialog: FC<InviteMemberDialogProps> = ({ open, onOpenChange, companyName, myRole }) => {
  const createInvitation = useCreateInvitation();
  const roleOptions = CompanyRoleFormOptions.filter((option) => canManageRole(myRole, option.id));
  const form = useForm<CreateInvitationFormData>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: "", role: CompanyRoles.MEMBER },
  });

  const handleOpenChange = (next: boolean) => {
    if (createInvitation.isPending) return;
    if (!next) form.reset();
    onOpenChange(next);
  };

  const onSubmit = (values: CreateInvitationFormData) =>
    createInvitation.mutate(values, { onSuccess: () => handleOpenChange(false) });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They get an email with a link to join {companyName}.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="off" placeholder="colleague@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <SelectField
                      className="w-full"
                      name={field.name}
                      ref={field.ref}
                      value={field.value}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      options={roleOptions}
                    />
                  </FormControl>
                  <FormDescription>
                    Members only see the agents they are given access to. Choose their agents with “Edit access”
                    once they have joined.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={createInvitation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <ActionButtonWithPending type="submit" isPending={createInvitation.isPending}>
                Send invitation
              </ActionButtonWithPending>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
