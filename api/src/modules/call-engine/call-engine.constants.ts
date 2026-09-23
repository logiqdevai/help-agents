/**
 * `code` values carried in the response body of the exceptions thrown by
 * `CallPlacementService.placeCall` (`new BadRequestException({ code, message })`).
 * Callers (e.g. scheduling) read them via `error.getResponse().code`.
 */
export const CallPlacementErrorCodes = {
  AGENT_NOT_ACTIVE: 'AGENT_NOT_ACTIVE',
  AGENT_NOT_SYNCED: 'AGENT_NOT_SYNCED',
  NO_PHONE_NUMBER_AVAILABLE: 'NO_PHONE_NUMBER_AVAILABLE',
  INVALID_PHONE_NUMBER: 'INVALID_PHONE_NUMBER',
  CONTACT_NOT_FOUND: 'CONTACT_NOT_FOUND',
  CONTACT_DO_NOT_CALL: 'CONTACT_DO_NOT_CALL',
  OUTSIDE_CALLING_HOURS: 'OUTSIDE_CALLING_HOURS',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
} as const;

export type CallPlacementErrorCode =
  (typeof CallPlacementErrorCodes)[keyof typeof CallPlacementErrorCodes];

/** Backoff before retrying a failed CallAction: attempt 1 -> 1m, 2 -> 5m, 3 -> 30m, 4 -> 2h (spec §34). */
export const ACTION_RETRY_DELAYS_MINUTES = [1, 5, 30, 120] as const;
