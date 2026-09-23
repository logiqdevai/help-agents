import { z } from 'zod';
import { ScheduledCallSource, ScheduledCallStatus } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

const dateParam = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: 'Invalid date' })
  .transform((v) => (v ? new Date(v) : undefined));

export const ScheduledCallQuerySchema = PaginationQuerySchema.extend({
  status: z.nativeEnum(ScheduledCallStatus).optional(),
  source: z.nativeEnum(ScheduledCallSource).optional(),
  agent_uuid: z.string().uuid().optional(),
  contact_uuid: z.string().uuid().optional(),
  from: dateParam,
  to: dateParam,
  order_direction: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ScheduledCallQueryType = z.infer<typeof ScheduledCallQuerySchema>;
