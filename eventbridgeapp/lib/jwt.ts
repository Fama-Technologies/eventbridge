// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';

/**
 * Get JWT secret from environment variables
 * Defers initialization to runtime to allow builds without NEXTAUTH_SECRET
 */
function getJWTSecret(): Uint8Array {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables');
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
}

/**
 * Custom JWT payload interface
 * Extends the base JWT payload with user-specific data
 */
export interface JWTPayload extends JoseJWTPayload {
  userId: number;
  email: string;
  accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';
}

/**
 * Create a signed JWT token
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as JoseJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJWTSecret());
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    return payload as JWTPayload;
  } catch (error) {
    // Token is invalid, expired, or malformed
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Type guard to check if account type is valid
 * @param accountType - String to check
 * @returns True if accountType is a valid account type
 */
export function isValidAccountType(
  accountType: string
): accountType is JWTPayload['accountType'] {
  return ['VENDOR', 'CUSTOMER', 'PLANNER', 'ADMIN'].includes(accountType);
}