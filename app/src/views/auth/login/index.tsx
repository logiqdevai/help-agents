"use client";

import type { FC } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { loginSchema, type LoginFormData } from "@/features/auth/validation-schemas/auth.schema";
import { Routes } from "@/routes/routes";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const LoginPage: FC = () => {
  const login = useLogin();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthShell
      artTitle="Calls handled. CRM updated."
      artText="Create voice agents that follow up, confirm and answer for your business, then see every call, outcome and cost in one place."
    >
      <AuthHeading title="Welcome back" lede="Log in to manage your agents, calls and knowledge." />
      <Form {...form}>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit((values) => login.mutate(values))}
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href={Routes.auth.forgotPassword}
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ActionButtonWithPending type="submit" size="lg" className="h-10 w-full" isPending={login.isPending}>
            Log in
          </ActionButtonWithPending>
        </form>
      </Form>
    </AuthShell>
  );
};

export default LoginPage;
