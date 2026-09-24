import { AlertSeverities, type AlertSeverity } from "@/features/alerts/interfaces/alerts.interfaces";

export const AlertSeverityFormOptions: { id: AlertSeverity; label: string }[] = [
  { id: AlertSeverities.ERROR, label: "Error" },
  { id: AlertSeverities.WARNING, label: "Warning" },
  { id: AlertSeverities.INFO, label: "Info" },
];
