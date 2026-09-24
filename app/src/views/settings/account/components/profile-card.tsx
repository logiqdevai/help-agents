"use client";

import type { FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { StatusBadge, StatusTones } from "@/components/ui/status-badge";
import { getLanguageOptions } from "@/config/constants/dropdowns/shared/language.options";
import { getTimezoneOptions } from "@/config/constants/dropdowns/shared/timezone.options";
import { useResendVerification, useUpdateProfile } from "@/features/auth/hooks/use-auth";
import type { AuthUser } from "@/features/auth/interfaces/auth.interfaces";
import { updateProfileSchema, type UpdateProfileFormData } from "@/features/auth/validation-schemas/auth.schema";
import { formatDate, initialsOf } from "@/lib/format";
import { SettingsCard } from "../../components/settings-card";

interface ProfileCardProps {
  user: AuthUser;
}

const DEFAULT_LANGUAGE = "en";

const toFormValues = (user: AuthUser): UpdateProfileFormData => ({
  name: user.name ?? "",
  phone: user.phone ?? "",
  timezone: user.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: user.language ?? DEFAULT_LANGUAGE,
});

export const ProfileCard: FC<ProfileCardProps> = ({ user }) => {
  const updateProfile = useUpdateProfile();
  const resendVerification = useResendVerification();
  const defaults = toFormValues(user);
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: defaults,
  });

  const onSubmit = (values: UpdateProfileFormData) =>
    updateProfile.mutate(
      { ...values, phone: values.phone?.trim() ?? "" },
      { onSuccess: () => form.reset(values) },
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <SettingsCard
          title="Profile"
          description="Your personal details. They apply to you in every company you belong to."
          footer={
            <>
              <span className="text-sm text-muted-foreground">Signed up {formatDate(user.created_at)}</span>
              <ActionButtonWithPending
                type="submit"
                size="lg"
                isPending={updateProfile.isPending}
                disabled={!form.formState.isDirty}
              >
                Save profile
              </ActionButtonWithPending>
            </>
          }
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
              <Avatar className="size-16">
                <AvatarFallback className="bg-gradient-lavender/60 text-lg font-medium">
                  {initialsOf(user.name ?? user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name ?? user.email}</p>
                <p className="text-sm text-muted-foreground">Your initials are shown wherever your avatar appears.</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2 sm:col-span-2">
                <label htmlFor="profile-email" className="text-sm leading-none font-medium">
                  Email
                </label>
                <div className="relative">
                  <Input id="profile-email" value={user.email} disabled readOnly className="pr-28" />
                  <span className="absolute inset-y-0 right-2 flex items-center">
                    <StatusBadge tone={user.email_verified ? StatusTones.SUCCESS : StatusTones.WARNING} dot>
                      {user.email_verified ? "Verified" : "Not verified"}
                    </StatusBadge>
                  </span>
                </div>
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  Contact support to change the email on your account.
                  {user.email_verified ? null : (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      disabled={resendVerification.isPending}
                      onClick={() => resendVerification.mutate()}
                    >
                      Resend verification email
                    </Button>
                  )}
                </p>
              </div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="font-normal text-muted-foreground">Optional</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" placeholder="+30 697 555 0100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <NativeSelect className="w-full" {...field}>
                        {getLanguageOptions(defaults.language).map((option) => (
                          <NativeSelectOption key={option.id} value={option.id}>
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <NativeSelect className="w-full" {...field}>
                        {getTimezoneOptions(defaults.timezone).map((option) => (
                          <NativeSelectOption key={option.id} value={option.id}>
                            {option.label}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </FormControl>
                    <FormDescription>Dates and times across the platform are shown in this timezone.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </SettingsCard>
      </form>
    </Form>
  );
};
