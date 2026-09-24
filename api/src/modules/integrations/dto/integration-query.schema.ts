import { z } from 'zod';
import { IntegrationCategory, IntegrationProvider, IntegrationStatus } from 'generated/prisma';
import { PaginationQuerySchema } from '@/shared/utils/pagination/pagination';

export const IntegrationQuerySchema = PaginationQuerySchema.extend({
  category: z.nativeEnum(IntegrationCategory).optional(),
  provider: z.nativeEnum(IntegrationProvider).optional(),
  status: z.nativeEnum(IntegrationStatus).optional(),
  search: z.string().trim().optional(),
});

export type IntegrationQueryType = z.infer<typeof IntegrationQuerySchema>;

export const CrmFieldsQuerySchema = z.object({
  record_type: z.enum(['CONTACT', 'LEAD', 'COMPANY', 'DEAL', 'OTHER']).optional().default('CONTACT'),
});

export type CrmFieldsQueryType = z.infer<typeof CrmFieldsQuerySchema>;

export const FieldMappingsQuerySchema = z.object({
  agent_uuid: z.string().uuid().optional(),
});

export type FieldMappingsQueryType = z.infer<typeof FieldMappingsQuerySchema>;

export const CrmToolsQuerySchema = z.object({
  /** Custom tools switched off are hidden unless the management screen asks for them. */
  include_inactive: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});

export type CrmToolsQueryType = z.infer<typeof CrmToolsQuerySchema>;
