"use client";

import type { FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPassword } from "@/features/auth/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/validation-schemas/auth.schema";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const ResetPasswordPage: FC = () => {
  const token = useSearchParams().get("token") ?? "";
  const resetPassword = useResetPassword();
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  return (
    <AuthShell
      orbs={["lavender", "mint", "rose", "peach"]}
      artTitle="A fresh start."
      artText="Choose a strong password you do not use anywhere else."
    >
      {resetPassword.isSuccess ? (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-semantic-success/10 text-semantic-success">
            <CircleCheckIcon className="size-5" aria-hidden />
          </span>
          <AuthHeading title="Password updated" lede="You can now log in with your new password." />
          <Link href={Routes.auth.login} className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            Log in
          </Link>
        </>
      ) : !token ? (
        <>
          <AuthHeading
            title="This link is not valid"
            lede="The reset link is missing its token. Request a new one and try again."
          />
          <Link
            href={Routes.auth.forgotPassword}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}
          >
            Request a new link
          </Link>
        </>
      ) : (
        <>
          <AuthHeading title="Choose a new password" lede="Use at least 8 characters." />
          <Form {...form}>
            <form
              className="flex flex-col gap-5"
              onSubmit={form.handleSubmit((values) => resetPassword.mutate({ token, password: values.password }))}
              noValidate
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <PasswordInput autoComplete="new-password" {...field} />
                    </FormControl>
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
              <ActionButtonWithPending
                type="submit"
                size="lg"
                className="h-10 w-full"
                isPending={resetPassword.isPending}
              >
                Update password
              </ActionButtonWithPending>
            </form>
          </Form>
        </>
      )}
    </AuthShell>
  );
};

export default ResetPasswordPage;
