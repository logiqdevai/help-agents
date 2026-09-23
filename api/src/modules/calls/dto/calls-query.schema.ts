import { z } from 'zod';
import { DateTime } from 'luxon';
import { CallDirection, CallStatus } from 'generated/prisma';
import { csvToArray, PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

const isoDate = z
  .string()
  .optional()
  .refine((v) => !v || DateTime.fromISO(v).isValid, { message: 'Must be an ISO date' });

const multi = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v.flatMap((item) => csvToArray(item) ?? []) : csvToArray(v)));

export const CallsQuerySchema = PaginationQuerySchema.extend({
  agent_uuid: z.string().uuid().optional(),
  from: isoDate,
  to: isoDate,
  outcome_key: z.string().max(100).optional(),
  status: multi.pipe(z.array(z.nativeEnum(CallStatus)).optional()),
  direction: z.nativeEnum(CallDirection).optional(),
  contact_uuid: z.string().uuid().optional(),
  integration_uuid: z.string().uuid().optional(),
  search: z.string().trim().max(100).optional(),
  is_test: z.enum(['true', 'false', 'all']).optional().default('false'),
  order_by: z.enum(['started_at', 'created_at']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CallsQueryType = z.infer<typeof CallsQuerySchema>;
