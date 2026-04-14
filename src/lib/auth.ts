import bcrypt from 'bcryptjs';

/**
 * Generate a client token from full name and first shoot date
 * Format: "JOHN DOE-2024-06-15"
 */
export function generateClientToken(fullName: string, firstShootDate: Date): string {
  const name = fullName.toUpperCase().trim();
  const date = firstShootDate.toISOString().split('T')[0];
  return `${name}-${date}`;
}

/**
 * Hash a token for storage in the database
 */
export async function hashToken(token: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(token, salt);
}

/**
 * Verify a token against a stored hash
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(token.toUpperCase(), hash);
}

/**
 * Generate a secure random string for sessions
 */
export function generateSessionToken(): string {
  return require('crypto').randomBytes(48).toString('base64url');
}

/**
 * Validate token format
 */
export function isValidTokenFormat(token: string): boolean {
  // Expected format: "NAME-YYYY-MM-DD"
  const regex = /^[A-Z][A-Z\s]+-[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  return regex.test(token.toUpperCase());
}

/**
 * Parse token into components
 */
export function parseToken(token: string): { fullName: string; shootDate: string } | null {
  const normalized = token.toUpperCase().trim();
  const parts = normalized.split('-');

  if (parts.length < 4) return null;

  const datePart = parts.slice(-3).join('-'); // YYYY-MM-DD
  const namePart = parts.slice(0, -3).join(' '); // Everything else is the name

  // Validate date format
  const dateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
  if (!dateRegex.test(datePart)) return null;

  // Validate name is not empty
  if (namePart.trim().length < 2) return null;

  return {
    fullName: namePart.trim(),
    shootDate: datePart,
  };
}
