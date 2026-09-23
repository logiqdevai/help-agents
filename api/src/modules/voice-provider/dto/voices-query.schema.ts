import { z } from 'zod';

export const VoicesQuerySchema = z.object({
  search: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
  accent: z.string().optional(),
});

export type VoicesQueryType = z.infer<typeof VoicesQuerySchema>;
