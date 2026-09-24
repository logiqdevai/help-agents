import { CostCategories, type CostCategory } from "@/features/calls/interfaces/calls.interfaces";

export const CallCostCategoryFormOptions: { id: CostCategory; label: string }[] = [
  { id: CostCategories.AI, label: "AI" },
  { id: CostCategories.TELEPHONY, label: "Phone / telephony" },
  { id: CostCategories.OTHER, label: "Other" },
];
