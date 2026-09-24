import { ActivityEntityTypeFormOptions } from "@/config/constants/dropdowns/activity/activity-entity-type-form.options";
import { ActivityEntityTypes, type ActivityLogEntry } from "@/features/activity-log/interfaces/activity-log.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { Routes } from "@/routes/routes";

export interface ActivityEntityRef {
  /** What the entry is about: a record name, or the kind of record when it has none. */
  label: string;
  /** Page of the record, when there is one. */
  href: string | null;
}

/** Name and page of the record an activity entry points at. */
export function getActivityEntity(entry: ActivityLogEntry): ActivityEntityRef | null {
  const { entity_type: type, entity_uuid: id, metadata } = entry;
  if (!type) return null;

  const metadataName = [metadata?.name, metadata?.email, metadata?.rule_name].find(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  const label = entry.entity_label ?? metadataName ?? getDropdownOptionLabel(ActivityEntityTypeFormOptions, type);

  switch (type) {
    case ActivityEntityTypes.AGENT:
      return { label, href: id ? Routes.agents.detail(id) : Routes.agents.root };
    case ActivityEntityTypes.CALL:
      return { label, href: id ? Routes.calls.detail(id) : Routes.calls.root };
    case ActivityEntityTypes.CALL_ACTION: {
      const callId = metadata?.call_uuid;
      return { label, href: typeof callId === "string" ? Routes.calls.detail(callId) : null };
    }
    case ActivityEntityTypes.SCHEDULED_CALL:
      return { label, href: Routes.calls.scheduled };
    case ActivityEntityTypes.INTEGRATION:
      return { label, href: id ? Routes.integrations.detail(id) : Routes.integrations.root };
    case ActivityEntityTypes.KNOWLEDGE_SOURCE:
      return { label, href: id ? Routes.knowledge.detail(id) : Routes.knowledge.root };
    case ActivityEntityTypes.PHONE_NUMBER:
      return { label, href: Routes.phoneNumbers };
    case ActivityEntityTypes.COMPANY_MEMBER:
    case ActivityEntityTypes.COMPANY_INVITATION:
      return { label, href: Routes.settings.team };
    case ActivityEntityTypes.COMPANY:
      return { label, href: Routes.settings.organization };
    case ActivityEntityTypes.ALERT:
      return { label, href: Routes.alerts };
    default:
      return { label, href: null };
  }
}
