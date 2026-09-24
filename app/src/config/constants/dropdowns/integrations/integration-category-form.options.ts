import {
  IntegrationCategories,
  type IntegrationCategory,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const IntegrationCategoryFormOptions: { id: IntegrationCategory; label: string }[] = [
  { id: IntegrationCategories.CRM, label: "CRM" },
  { id: IntegrationCategories.KNOWLEDGE, label: "Knowledge" },
  { id: IntegrationCategories.CALENDAR, label: "Calendar" },
  { id: IntegrationCategories.EMAIL, label: "Email" },
  { id: IntegrationCategories.MESSAGING, label: "Messaging" },
  { id: IntegrationCategories.STORAGE, label: "Storage" },
  { id: IntegrationCategories.OTHER, label: "Other" },
];

export function getIntegrationCategoryLabel(category: IntegrationCategory | string): string {
  return IntegrationCategoryFormOptions.find((option) => option.id === category)?.label ?? category;
}
