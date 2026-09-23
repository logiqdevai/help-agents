import { z } from 'zod';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const PricingRateQuerySchema = PaginationQuerySchema.extend({
  key: z.string().optional(),
  company_uuid: z.string().uuid().optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type PricingRateQueryType = z.infer<typeof PricingRateQuerySchema>;
