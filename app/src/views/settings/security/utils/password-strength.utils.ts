export const PASSWORD_STRENGTH_MAX = 4;

/**
 * Rough strength score from 0 (shorter than the 8-character minimum) to 4 (strong).
 * Length matters most; mixing character kinds adds a point. The API only enforces the length.
 */
export function getPasswordStrength(password: string): number {
  if (password.length < 8) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((pattern) => pattern.test(password)).length;
  let score = 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (kinds >= 3) score += 1;
  return Math.min(score, PASSWORD_STRENGTH_MAX);
}
