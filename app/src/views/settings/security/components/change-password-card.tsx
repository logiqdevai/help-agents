"use client";

import type { FC } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthLabelOptions } from "@/config/constants/dropdowns/users/password-strength.options";
import { useChangePassword } from "@/features/auth/hooks/use-auth";
import { changePasswordSchema, type ChangePasswordFormData } from "@/features/auth/validation-schemas/auth.schema";
import { cn } from "@/lib/utils";
import { SettingsCard } from "../../components/settings-card";
import { PASSWORD_STRENGTH_MAX, getPasswordStrength } from "../utils/password-strength.utils";

const StrengthMeter: FC<{ password: string }> = ({ password }) => {
  const score = getPasswordStrength(password);
  const option = PasswordStrengthLabelOptions.find((o) => o.id === score);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5" aria-hidden>
        {Array.from({ length: PASSWORD_STRENGTH_MAX }).map((_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full bg-border", i < score && "bg-foreground")} />
        ))}
      </div>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {option?.hint}
      </p>
    </div>
  );
};

export const ChangePasswordCard: FC = () => {
  const changePassword = useChangePassword();
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });
  const newPassword = useWatch({ control: form.control, name: "new_password" });

  const onSubmit = (values: ChangePasswordFormData) =>
    changePassword.mutate(
      { current_password: values.current_password, new_password: values.new_password },
      { onSuccess: () => form.reset() },
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <SettingsCard
          title="Change password"
          description="Use at least 8 characters. You will stay signed in on this device."
          footer={
            <>
              <span className="text-sm text-muted-foreground">Choose a password you do not use anywhere else.</span>
              <ActionButtonWithPending type="submit" size="lg" isPending={changePassword.isPending}>
                Update password
              </ActionButtonWithPending>
            </>
          }
        >
          <div className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  {newPassword ? <StrengthMeter password={newPassword} /> : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};
