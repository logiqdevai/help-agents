"use client";

import type { FC } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { signupSchema, type SignupFormData } from "@/features/auth/validation-schemas/auth.schema";
import { Routes } from "@/routes/routes";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const SignupPage: FC = () => {
  const register = useRegister();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", company_name: "", phone: "" },
  });

  const onSubmit = (values: SignupFormData) => {
    register.mutate({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      company_name: values.company_name.trim(),
      phone: values.phone?.trim() || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return (
    <AuthShell
      orbs={["peach", "rose", "mint", "lavender"]}
      artTitle="Set up once. Let it call."
      artText="Connect your CRM, add what your agents should know, and go live with a tested agent, without touching any voice infrastructure."
    >
      <AuthHeading
        title="Create your account"
        lede="Set up your company workspace in a few minutes. Your team, agents and call history stay private to your company."
      />
      <Form {...form}>
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Petros Rodinos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company name</FormLabel>
                <FormControl>
                  <Input autoComplete="organization" placeholder="Aegean Homes" {...field} />
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
                <FormLabel>
                  Phone <span className="font-normal text-muted-foreground">Optional</span>
                </FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" placeholder="+30 21 0000 0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <ActionButtonWithPending type="submit" size="lg" className="h-10 w-full" isPending={register.isPending}>
            Create account
          </ActionButtonWithPending>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href={Routes.auth.login} className="text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  );
};

export default SignupPage;
