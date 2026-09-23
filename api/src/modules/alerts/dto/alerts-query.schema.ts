import { z } from 'zod';
import { AlertSeverity, AlertStatus, AlertType } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const AlertsQuerySchema = PaginationQuerySchema.extend({
  status: z.union([z.nativeEnum(AlertStatus), z.literal('ALL')]).optional().default(AlertStatus.OPEN),
  type: z.nativeEnum(AlertType).optional(),
  severity: z.nativeEnum(AlertSeverity).optional(),
  entity_type: z.string().min(1).optional(),
  entity_uuid: z.string().uuid().optional(),
});

export type AlertsQueryType = z.infer<typeof AlertsQuerySchema>;
