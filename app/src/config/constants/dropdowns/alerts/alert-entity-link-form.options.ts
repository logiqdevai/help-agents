import { AlertEntityTypes, type AlertEntityType } from "@/features/alerts/interfaces/alerts.interfaces";

/** Link text for the record an alert points at, keyed by the API's `entity_type`. */
export const AlertEntityLinkFormOptions: { id: AlertEntityType; label: string }[] = [
  { id: AlertEntityTypes.CALL, label: "View call" },
  { id: AlertEntityTypes.CALL_ACTION, label: "View call" },
  { id: AlertEntityTypes.INTEGRATION, label: "Open connection" },
  { id: AlertEntityTypes.AGENT, label: "Open agent" },
  { id: AlertEntityTypes.KNOWLEDGE_SOURCE, label: "Open knowledge source" },
  { id: AlertEntityTypes.SCHEDULED_CALL, label: "View scheduled calls" },
];
