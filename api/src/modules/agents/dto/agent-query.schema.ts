import { z } from 'zod';
import { AgentStatus } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const AgentQuerySchema = PaginationQuerySchema.extend({
  status: z.nativeEnum(AgentStatus).optional(),
  search: z.string().trim().optional(),
  crm_integration_uuid: z.string().uuid().optional(),
  order_by: z.enum(['created_at', 'updated_at', 'name']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type AgentQueryType = z.infer<typeof AgentQuerySchema>;
