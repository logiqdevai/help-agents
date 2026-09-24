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
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getCompanyRoleDescription } from "@/config/constants/dropdowns/users/company-role-description.options";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";
import { useUpdateMember } from "@/features/team/hooks/use-team";
import type { TeamMember } from "@/features/team/interfaces/team.interfaces";
import { canManageRole } from "@/features/team/utils/team-policy.utils";
import {
  updateMemberRoleSchema,
  type UpdateMemberRoleFormData,
} from "@/features/team/validation-schemas/team.schema";

interface ChangeRoleDialogProps {
  member: TeamMember | null;
  onClose: () => void;
  myRole: CompanyRole | undefined;
}

interface ChangeRoleFormProps {
  member: TeamMember;
  onClose: () => void;
  myRole: CompanyRole | undefined;
}

const ChangeRoleForm: FC<ChangeRoleFormProps> = ({ member, onClose, myRole }) => {
  const updateMember = useUpdateMember();
  const roleOptions = CompanyRoleFormOptions.filter((option) => canManageRole(myRole, option.id));
  const form = useForm<UpdateMemberRoleFormData>({
    resolver: zodResolver(updateMemberRoleSchema),
    defaultValues: { role: member.role },
  });

  const onSubmit = (values: UpdateMemberRoleFormData) =>
    updateMember.mutate({ id: member.id, role: values.role }, { onSuccess: onClose });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <RadioGroup
                aria-label="Role"
                value={field.value}
                onValueChange={field.onChange}
                className="gap-2"
              >
                {roleOptions.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors has-data-checked:border-foreground/40 has-data-checked:bg-muted/60"
                  >
                    <RadioGroupItem value={option.id} className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-muted-foreground">{getCompanyRoleDescription(option.id)}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" disabled={updateMember.isPending} onClick={onClose}>
            Cancel
          </Button>
          <ActionButtonWithPending
            type="submit"
            isPending={updateMember.isPending}
            disabled={!form.formState.isDirty}
          >
            Update role
          </ActionButtonWithPending>
        </DialogFooter>
      </form>
    </Form>
  );
};

export const ChangeRoleDialog: FC<ChangeRoleDialogProps> = ({ member, onClose, myRole }) => (
  <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change role</DialogTitle>
        <DialogDescription>
          The new role applies the next time {member?.user.name ?? member?.user.email ?? "they"} open the platform.
        </DialogDescription>
      </DialogHeader>
      {member ? <ChangeRoleForm key={member.id} member={member} onClose={onClose} myRole={myRole} /> : null}
    </DialogContent>
  </Dialog>
);
