export const AuthRoles = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    SUPPORT: 'SUPPORT',
    SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type AuthRole = (typeof AuthRoles)[keyof typeof AuthRoles];

export interface AuthCompanySummary {
    id: string;
    name: string;
    role: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    timezone: string | null;
    language: string | null;
    role: string;
    email_verified: boolean;
    created_at: Date;
}

export interface AuthSession {
    access_token: string;
    expires_in: number;
    user: AuthUser;
    companies: AuthCompanySummary[];
}
