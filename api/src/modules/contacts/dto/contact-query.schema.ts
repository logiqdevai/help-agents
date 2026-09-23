import { z } from 'zod';
import { CrmRecordType } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const ContactQuerySchema = PaginationQuerySchema.extend({
  search: z.string().trim().optional(),
  integration_uuid: z.string().uuid().optional(),
  record_type: z.nativeEnum(CrmRecordType).optional(),
  do_not_call: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  order_by: z.enum(['created_at', 'name', 'updated_at']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ContactQueryType = z.infer<typeof ContactQuerySchema>;
