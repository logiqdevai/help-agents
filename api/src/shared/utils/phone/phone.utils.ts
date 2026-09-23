import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

/** Returns the E.164 form ("+30211234567") or null when the number is not valid. */
export function toE164(raw: string | null | undefined, defaultCountry?: string): string | null {
  if (!raw) return null;
  const parsed = parsePhoneNumberFromString(raw.trim(), defaultCountry as CountryCode | undefined);
  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}

export function isValidPhone(raw: string | null | undefined, defaultCountry?: string): boolean {
  return toE164(raw, defaultCountry) !== null;
}
