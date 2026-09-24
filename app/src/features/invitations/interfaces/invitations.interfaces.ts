import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

export interface InvitationPreview {
  company_name: string;
  email: string;
  role: CompanyRole;
  expires_at: string;
  /** True when the invited email already has a password — the invitee should log in, not sign up. */
  account_exists: boolean;
}

export interface AcceptInvitationResult {
  company: { id: string; name: string };
  role: CompanyRole;
}
