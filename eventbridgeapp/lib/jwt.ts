// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';

// Defer JWT secret initialization to runtime to allow builds without NEXTAUTH_SECRET
function getJWTSecret(): Uint8Array {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is not set in environment variables');
  }
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
}

export interface JWTPayload extends JoseJWTPayload {
  userId: number;
  email: string;
  accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER';
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as JoseJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJWTSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Helper function to check if account type is valid
export function isValidAccountType(accountType: string): accountType is JWTPayload['accountType'] {
  return ['VENDOR', 'CUSTOMER', 'PLANNER'].includes(accountType as any);
}