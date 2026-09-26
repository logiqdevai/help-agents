"use client";

import { useEffect, useRef, type FC } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BadgeCheckIcon, MailIcon, TriangleAlertIcon } from "lucide-react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResendVerification, useVerifyEmail } from "@/features/auth/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { AuthHeading, AuthShell } from "../components/auth-shell";

const VerifyEmailPage: FC = () => {
  const token = useSearchParams().get("token") ?? "";
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setProfile = useAuthStore((state) => state.setProfile);
  const attempted = useRef(false);

  useEffect(() => {
    if (!token || attempted.current) return;
    attempted.current = true;
    verify.mutate(
      { token },
      {
        onSuccess: () => {
          const current = useAuthStore.getState().user;
          if (current) setProfile({ user: { ...current, email_verified: true } });
        },
      },
    );
  }, [token, verify, setProfile]);

  const continueHref = accessToken ? Routes.dashboard : Routes.auth.login;

  return (
    <AuthShell
      orbs={["mint", "sky", "peach", "lavender"]}
      artTitle="One quick step."
      artText="Verifying your email keeps your company account and its call data secure."
    >
      {token && (verify.isPending || verify.isIdle) ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : token && verify.isSuccess ? (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-semantic-success/10 text-semantic-success">
            <BadgeCheckIcon className="size-6" aria-hidden />
          </span>
          <AuthHeading
            title="Email verified"
            lede="Thanks. Your email address is confirmed and your workspace is ready."
          />
          <Link href={continueHref} className={cn(buttonVariants({ size: "lg" }), "h-10")}>
            {accessToken ? "Continue to dashboard" : "Log in"}
          </Link>
        </>
      ) : token && verify.isError ? (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlertIcon className="size-5" aria-hidden />
          </span>
          <AuthHeading title="This link did not work" lede={verify.error.message} />
          {accessToken ? (
            <ActionButtonWithPending
              variant="outline"
              size="lg"
              className="h-10"
              isPending={resend.isPending}
              onClick={() => resend.mutate()}
            >
              Send a new verification email
            </ActionButtonWithPending>
          ) : (
            <Link href={Routes.auth.login} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10")}>
              Log in to request a new link
            </Link>
          )}
        </>
      ) : (
        <>
          <span className="flex size-12 items-center justify-center rounded-full bg-gradient-mint/60">
            <MailIcon className="size-5" aria-hidden />
          </span>
          <AuthHeading
            title="Check your inbox"
            lede={
              <>
                We sent a verification link{user?.email ? " to " : ""}
                {user?.email ? <b className="text-foreground">{user.email}</b> : null}. Open it to activate your
                account.
              </>
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            {accessToken ? (
              <ActionButtonWithPending
                variant="outline"
                size="lg"
                className="h-10"
                isPending={resend.isPending}
                onClick={() => resend.mutate()}
              >
                Resend email
              </ActionButtonWithPending>
            ) : null}
            <Link href={continueHref} className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-10")}>
              {accessToken ? "Continue to dashboard" : "Back to log in"}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Can&apos;t find it? Check your spam folder. The link expires in 24 hours.
          </p>
        </>
      )}
    </AuthShell>
  );
};

export default VerifyEmailPage;
