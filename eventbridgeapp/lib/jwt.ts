// lib/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload as JoseJWTPayload } from 'jose';

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export interface JWTPayload extends JoseJWTPayload {
  userId: number;
  email: string;
  accountType: 'VENDOR' | 'CUSTOMER';
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as JoseJWTPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}
