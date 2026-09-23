export const DELETION_GRACE_DAYS = 7;

/** A claimed purge that has not finished after this long is considered crashed and is retried. */
export const STALLED_PURGE_MS = 60 * 60 * 1000;

export const PURGE_BATCH_SIZE = 500;
export const STORAGE_DELETE_CONCURRENCY = 10;
export const MAX_COMPANIES_PER_RUN = 20;
