import { z } from 'zod';
import { ScheduledCallSource, ScheduledCallStatus } from 'generated/prisma';
import { csvToArray, PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

const dateParam = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: 'Invalid date' })
  .transform((v) => (v ? new Date(v) : undefined));

const multi = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v.flatMap((item) => csvToArray(item) ?? []) : csvToArray(v)));

export const ScheduledCallQuerySchema = PaginationQuerySchema.extend({
  status: multi.pipe(z.array(z.nativeEnum(ScheduledCallStatus)).optional()),
  search: z.string().trim().max(100).optional(),
  source: z.nativeEnum(ScheduledCallSource).optional(),
  agent_uuid: z.string().uuid().optional(),
  contact_uuid: z.string().uuid().optional(),
  from: dateParam,
  to: dateParam,
  order_direction: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type ScheduledCallQueryType = z.infer<typeof ScheduledCallQuerySchema>;
