"use client";

import type { FC } from "react";
import Link from "next/link";
import { MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/features/auth/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/validation-schemas/auth.schema";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const ForgotPasswordPage: FC = () => {
  const forgotPassword = useForgotPassword();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const sentTo = forgotPassword.isSuccess ? form.getValues("email") : null;

  return (
    <AuthShell
      orbs={["sky", "mint", "peach", "lavender"]}
      artTitle="Locked out? It happens."
      artText="We will email you a secure link to choose a new password."
    >
      {sentTo ? (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-gradient-mint/60">
            <MailIcon className="size-5" aria-hidden />
          </span>
          <AuthHeading
            title="Check your inbox"
            lede={
              <>
                If an account exists for <b className="text-foreground">{sentTo}</b>, we sent a link to reset your
                password. It expires soon, so use it right away.
              </>
            }
          />
          <Link href={Routes.auth.login} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
            Back to log in
          </Link>
        </>
      ) : (
        <>
          <AuthHeading title="Forgot your password?" lede="Enter your email and we will send you a reset link." />
          <Form {...form}>
            <form
              className="flex flex-col gap-5"
              onSubmit={form.handleSubmit((values) => forgotPassword.mutate(values))}
              noValidate
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ActionButtonWithPending
                type="submit"
                size="lg"
                className="h-10 w-full"
                isPending={forgotPassword.isPending}
              >
                Send reset link
              </ActionButtonWithPending>
              <p className="text-center text-sm text-muted-foreground">
                <Link href={Routes.auth.login} className="text-foreground underline underline-offset-4">
                  Back to log in
                </Link>
              </p>
            </form>
          </Form>
        </>
      )}
    </AuthShell>
  );
};

export default ForgotPasswordPage;
