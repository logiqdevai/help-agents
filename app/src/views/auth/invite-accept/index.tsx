"use client";

import type { FC } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { CompanyRoleFormOptions } from "@/config/constants/dropdowns/users/company-role-form.options";
import { useRegister } from "@/features/auth/hooks/use-auth";
import {
  inviteSignupSchema,
  type InviteSignupFormData,
} from "@/features/auth/validation-schemas/auth.schema";
import { useAcceptInvitation, useInvitationPreview } from "@/features/invitations/hooks/use-invitations";
import { formatDate } from "@/lib/format";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const InviteAcceptPage: FC = () => {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();
  const register = useRegister();
  const signedInEmail = useAuthStore((state) => state.user?.email);
  const accessToken = useAuthStore((state) => state.accessToken);

  const form = useForm<InviteSignupFormData>({
    resolver: zodResolver(inviteSignupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const invite = preview.data;
  const roleLabel = invite ? getDropdownOptionLabel(CompanyRoleFormOptions, invite.role) : "";
  const isRightAccount =
    !!invite && !!signedInEmail && signedInEmail.toLowerCase() === invite.email.toLowerCase();

  const handleAccept = () =>
    accept.mutate(token, { onSuccess: () => router.replace(Routes.dashboard) });

  const handleSignup = (values: InviteSignupFormData) => {
    if (!invite) return;
    register.mutate({
      name: values.name.trim(),
      email: invite.email,
      password: values.password,
      invitation_token: token,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return (
    <AuthShell
      orbs={["lavender", "mint", "rose", "peach"]}
      artTitle="Better together."
      artText="Your team shares the same agents, CRM connections, knowledge and reporting, with access matched to each role."
    >
      {!token || preview.isError ? (
        <>
          <AuthHeading
            title="Invitation not found"
            lede="This invitation link is invalid, has already been used, or has expired. Ask your team admin to send a new one."
          />
          <Link href={Routes.auth.login} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
            Go to log in
          </Link>
        </>
      ) : preview.isPending || !invite ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <>
          <div>
            <StatusBadge className="mb-5">{roleLabel}</StatusBadge>
            <AuthHeading
              title={`Join ${invite.company_name}`}
              lede={
                <>
                  You have been invited to join <b className="text-foreground">{invite.company_name}</b> as{" "}
                  <b className="text-foreground">{roleLabel}</b> using <b className="text-foreground">{invite.email}</b>.
                </>
              }
            />
          </div>

          {isRightAccount ? (
            <ActionButtonWithPending size="lg" className="h-10 w-full" isPending={accept.isPending} onClick={handleAccept}>
              Accept and join
            </ActionButtonWithPending>
          ) : invite.account_exists ? (
            <>
              <p className="text-sm text-muted-foreground">
                {accessToken
                  ? `You are signed in as ${signedInEmail}. Log in with ${invite.email} to accept this invitation.`
                  : `An account already exists for ${invite.email}. Log in to accept this invitation.`}
              </p>
              <Link
                href={`${Routes.auth.login}`}
                className={cn(buttonVariants({ size: "lg" }), "h-10")}
                onClick={() => useAuthStore.getState().clear()}
              >
                Log in to accept
              </Link>
            </>
          ) : (
            <Form {...form}>
              <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(handleSignup)} noValidate>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={invite.email} disabled readOnly />
                </FormItem>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your name</FormLabel>
                      <FormControl>
                        <Input autoComplete="name" {...field} />
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
                      <FormLabel>Choose a password</FormLabel>
                      <FormControl>
                        <PasswordInput autoComplete="new-password" placeholder="At least 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <ActionButtonWithPending
                  type="submit"
                  size="lg"
                  className="h-10 w-full"
                  isPending={register.isPending}
                >
                  Accept and join
                </ActionButtonWithPending>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href={Routes.auth.login} className="text-foreground underline underline-offset-4">
                    Log in to accept
                  </Link>
                </p>
              </form>
            </Form>
          )}
          <p className="text-center text-xs text-muted-foreground">
            This invitation expires on {formatDate(invite.expires_at)}.
          </p>
        </>
      )}
    </AuthShell>
  );
};

export default InviteAcceptPage;
