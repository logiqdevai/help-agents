export interface Pagination {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface MessageResponse {
  message: string;
}

/** Drops undefined / null / "" / "all" values so they are not sent as query params. */
export function cleanParams<T extends object>(params?: T): Partial<T> | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "" && v !== "all",
    ),
  ) as Partial<T>;
}
