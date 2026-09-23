import { z } from 'zod';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

const optionalDate = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), { message: 'Must be a valid ISO date' });

export const ActivityLogQuerySchema = PaginationQuerySchema.extend({
  entity_type: z.string().min(1).optional(),
  entity_uuid: z.string().uuid().optional(),
  user_uuid: z.string().uuid().optional(),
  action: z.string().min(1).optional(),
  from: optionalDate,
  to: optionalDate,
});

export type ActivityLogQueryType = z.infer<typeof ActivityLogQuerySchema>;
