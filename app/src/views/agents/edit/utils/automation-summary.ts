import { AutomationActionTypeFormOptions } from "@/config/constants/dropdowns/agents/automation-action-type-form.options";
import {
  AutomationActionTypes,
  MinutesPerDelayUnit,
  DelayUnits,
  type AutomationAction,
} from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatDelayMinutes } from "@/views/agents/utils/retry-format";

export interface ActionSummary {
  label: string;
  /** What this particular action does, e.g. "status → Interested"; null when the label says it all. */
  detail: string | null;
  /** "Immediately" or "After 2 days". */
  when: string;
}

const asText = (value: unknown): string => (typeof value === "string" ? value : "");
const asNumber = (value: unknown): number => (typeof value === "number" ? value : 0);
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const hostOf = (url: string): string => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

/** A one-line reading of an automation action for a rule card. */
export function summarizeAction(action: AutomationAction): ActionSummary {
  const config = asRecord(action.config);
  const label = getDropdownOptionLabel(AutomationActionTypeFormOptions, action.type);

  // A follow-up call carries its wait in its own settings; every other action waits before it runs.
  const waitMinutes =
    action.type === AutomationActionTypes.SCHEDULE_FOLLOW_UP
      ? asNumber(config.delay_minutes) +
        asNumber(config.delay_days) * MinutesPerDelayUnit[DelayUnits.DAYS] +
        action.delay_minutes
      : action.delay_minutes;
  const when = waitMinutes > 0 ? `After ${formatDelayMinutes(waitMinutes)}` : "Immediately";

  switch (action.type) {
    case AutomationActionTypes.UPDATE_CRM: {
      const fields = Object.entries(asRecord(config.fields));
      return {
        label,
        detail: fields.length ? fields.map(([name, value]) => `${name} → ${String(value ?? "")}`).join(", ") : "call result",
        when,
      };
    }
    case AutomationActionTypes.CREATE_CRM_TASK:
      return { label, detail: asText(config.title) || null, when };
    case AutomationActionTypes.CREATE_CALENDAR_EVENT:
      return { label, detail: asText(config.title) || null, when };
    case AutomationActionTypes.SEND_EMAIL:
      return { label, detail: asText(config.subject) || null, when };
    case AutomationActionTypes.WEBHOOK:
      return { label, detail: hostOf(asText(config.url)) || null, when };
    default:
      return { label, detail: null, when };
  }
}
