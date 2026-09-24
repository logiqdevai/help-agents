import { z } from 'zod';
import { KnowledgeSourceType, KnowledgeStatus } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const KnowledgeQuerySchema = PaginationQuerySchema.extend({
  status: z.nativeEnum(KnowledgeStatus).optional(),
  type: z.nativeEnum(KnowledgeSourceType).optional(),
  is_enabled: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  agent_uuid: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  order_by: z.enum(['created_at', 'updated_at', 'name']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type KnowledgeQueryType = z.infer<typeof KnowledgeQuerySchema>;
