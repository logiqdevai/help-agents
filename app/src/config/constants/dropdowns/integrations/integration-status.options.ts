import {
  IntegrationStatuses,
  type IntegrationStatus,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationStatusOptions: { id: IntegrationStatus; label: string }[] = [
  { id: IntegrationStatuses.PENDING, label: "Pending" },
  { id: IntegrationStatuses.ACTIVE, label: "Active" },
  { id: IntegrationStatuses.ERROR, label: "Error" },
  { id: IntegrationStatuses.DISCONNECTED, label: "Disconnected" },
];
