"use client";

import type { FC } from "react";
import { ChangePasswordCard } from "./components/change-password-card";
import { CredentialsPanel } from "./components/credentials-panel";
import { EmailVerificationCard } from "./components/email-verification-card";
import { SessionsCard } from "./components/sessions-card";

const SecuritySettingsPage: FC = () => (
  <div className="flex max-w-3xl flex-col gap-6">
    <EmailVerificationCard />
    <ChangePasswordCard />
    <SessionsCard />
    <CredentialsPanel />
  </div>
);

export default SecuritySettingsPage;
