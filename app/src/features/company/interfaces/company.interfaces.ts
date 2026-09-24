import type { CompanyRole } from "@/features/auth/interfaces/auth.interfaces";

export interface Company {
  id: string;
  name: string;
  website: string | null;
  phone: string | null;
  timezone: string;
  recording_retention_days: number | null;
  deletion_requested_at: string | null;
  created_at: string;
  updated_at: string;
  member_count: number;
  my_role: CompanyRole;
  my_permissions: string[];
}

export interface CompanySummary {
  id: string;
  name: string;
  timezone: string;
  member_count: number;
  role: CompanyRole;
}

export interface UpdateCompanyDto {
  name?: string;
  website?: string | null;
  phone?: string | null;
  timezone?: string;
  recording_retention_days?: number | null;
}

export interface CallingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_enabled: boolean;
}

export interface CallingHours {
  timezone: string;
  days: CallingHour[];
}

export interface SetCallingHoursDto {
  days: CallingHour[];
}

export interface CompanyDeletionStatus {
  deletion_requested: boolean;
  requested_at: string | null;
  scheduled_purge_at: string | null;
  grace_period_days: number;
}

export interface RequestCompanyDeletionDto {
  password: string;
  company_name: string;
}
