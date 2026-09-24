import { AlertEntityLinkFormOptions } from "@/config/constants/dropdowns/alerts/alert-entity-link-form.options";
import { AlertEntityTypes, type Alert } from "@/features/alerts/interfaces/alerts.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";

export interface AlertEntityLink {
  href: string;
  label: string;
}

/** The page of the record an alert is about, or null when there is nothing to open. */
export function getAlertEntityLink(alert: Alert): AlertEntityLink | null {
  const { entity_type: type, entity_uuid: id, metadata } = alert;
  if (!type) return null;

  const label = getDropdownOptionLabel(AlertEntityLinkFormOptions, type);
  switch (type) {
    case AlertEntityTypes.CALL:
      return id ? { href: Routes.calls.detail(id), label } : null;
    case AlertEntityTypes.CALL_ACTION:
      return metadata?.call_uuid ? { href: Routes.calls.detail(metadata.call_uuid), label } : null;
    case AlertEntityTypes.INTEGRATION:
      return id ? { href: Routes.integrations.detail(id), label } : null;
    case AlertEntityTypes.AGENT:
      return id ? { href: Routes.agents.detail(id), label } : null;
    case AlertEntityTypes.KNOWLEDGE_SOURCE:
      return id ? { href: Routes.knowledge.detail(id), label } : null;
    case AlertEntityTypes.SCHEDULED_CALL:
      return { href: Routes.calls.scheduled, label };
    default:
      return null;
  }
}
