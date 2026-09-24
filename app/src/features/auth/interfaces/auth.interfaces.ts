export const CompanyRoles = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
  VIEWER: "VIEWER",
} as const;
export type CompanyRole = (typeof CompanyRoles)[keyof typeof CompanyRoles];

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  timezone: string | null;
  language: string | null;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface AuthCompany {
  id: string;
  name: string;
  role: CompanyRole;
}

export interface AuthSession {
  access_token: string;
  expires_in: number;
  user: AuthUser;
  companies: AuthCompany[];
}

export interface AuthProfile {
  user: AuthUser;
  companies: AuthCompany[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  company_name?: string;
  phone?: string;
  timezone?: string;
  invitation_token?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  timezone?: string;
  language?: string;
}
