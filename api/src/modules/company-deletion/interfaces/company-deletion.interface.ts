export interface CompanyDeletionStatus {
  deletion_requested: boolean;
  requested_at: Date | null;
  scheduled_purge_at: Date | null;
  grace_period_days: number;
}
