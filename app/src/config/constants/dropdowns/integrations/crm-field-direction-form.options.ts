import {
  MappingDirections,
  type MappingDirection,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const CrmFieldDirectionFormOptions: { id: MappingDirection; label: string }[] = [
  { id: MappingDirections.BOTH, label: "Read + write" },
  { id: MappingDirections.READ, label: "Read" },
  { id: MappingDirections.WRITE, label: "Write" },
];
