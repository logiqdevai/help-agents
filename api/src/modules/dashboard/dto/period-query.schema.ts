import { z } from 'zod';

const boolFromQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

const periodShape = {
  period: z.enum(['today', '7d', '30d', 'custom']).optional().default('today'),
  from: z.string().optional(),
  to: z.string().optional(),
  include_test: boolFromQuery,
};

const customRangeRefinement = (
  value: { period?: string; from?: string; to?: string },
  ctx: z.RefinementCtx,
) => {
  if (value.period === 'custom' && (!value.from || !value.to)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '`from` and `to` are required when period=custom',
      path: ['from'],
    });
  }
};

export const DashboardQuerySchema = z.object(periodShape).superRefine(customRangeRefinement);
export type DashboardQueryType = z.infer<typeof DashboardQuerySchema>;

export const UsageQuerySchema = z
  .object({ ...periodShape, agent_uuid: z.string().uuid().optional() })
  .superRefine(customRangeRefinement);
export type UsageQueryType = z.infer<typeof UsageQuerySchema>;

export const UsageTimeseriesQuerySchema = z
  .object({
    ...periodShape,
    agent_uuid: z.string().uuid().optional(),
    bucket: z.enum(['hour', 'day', 'week']).optional(),
  })
  .superRefine(customRangeRefinement);
export type UsageTimeseriesQueryType = z.infer<typeof UsageTimeseriesQuerySchema>;
