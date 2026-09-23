import { ActorType } from 'generated/prisma';

export interface ActivityLogItem {
  id: string;
  actor: { id: string; name: string | null; email: string } | null;
  actor_type: ActorType;
  action: string;
  entity_type: string | null;
  entity_uuid: string | null;
  metadata: unknown;
  created_at: Date;
}
