import { z } from 'zod';
import { PhoneNumberSource, PhoneNumberStatus } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const PhoneNumbersQuerySchema = PaginationQuerySchema.extend({
  status: z.nativeEnum(PhoneNumberStatus).optional(),
  source: z.nativeEnum(PhoneNumberSource).optional(),
  agent_uuid: z.string().uuid().optional(),
  search: z.string().trim().optional(),
  order_by: z.enum(['created_at', 'number']).optional().default('created_at'),
  order_direction: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PhoneNumbersQueryType = z.infer<typeof PhoneNumbersQuerySchema>;
