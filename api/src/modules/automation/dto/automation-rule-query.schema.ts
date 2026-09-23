import { z } from 'zod';
import { AutomationTrigger } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const AutomationRuleQuerySchema = PaginationQuerySchema.extend({
  trigger: z.nativeEnum(AutomationTrigger).optional(),
  agent_uuid: z.string().uuid().optional(),
  is_enabled: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});

export type AutomationRuleQueryType = z.infer<typeof AutomationRuleQuerySchema>;
