import {
  ApiKeyPlacements,
  type ApiKeyPlacement,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const ApiKeyPlacementFormOptions: { id: ApiKeyPlacement; label: string }[] = [
  { id: ApiKeyPlacements.HEADER, label: "Request header" },
  { id: ApiKeyPlacements.QUERY, label: "Query string" },
];
