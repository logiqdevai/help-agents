import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, v ? parseInt(v, 10) || 1 : 1)),
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, v ? parseInt(v, 10) || 20 : 20))),
});

export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const total_pages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    },
  };
}

export function skipTake(query: { page?: number; limit?: number }) {
  return { skip: (query.page - 1) * query.limit, take: query.limit };
}

/** Parses a comma separated query value ("a,b") into a trimmed string array. */
export function csvToArray(value?: string): string[] | undefined {
  if (!value) return undefined;
  const items = value.split(',').map((v) => v.trim()).filter(Boolean);
  return items.length ? items : undefined;
}
