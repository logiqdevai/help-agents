import { AlertStatuses, type AlertStatus } from "@/features/alerts/interfaces/alerts.interfaces";

export const AlertStatusFormOptions: { id: AlertStatus; label: string }[] = [
  { id: AlertStatuses.OPEN, label: "Open" },
  { id: AlertStatuses.RESOLVED, label: "Resolved" },
  { id: AlertStatuses.DISMISSED, label: "Dismissed" },
];
