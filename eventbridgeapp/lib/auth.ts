// lib/auth.ts
import { NextRequest } from 'next/server';
import { verifyToken, type JWTPayload } from '@/lib/jwt'; 
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: 'VENDOR' | 'CUSTOMER';
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = req.cookies.get('auth-token')?.value || 
                  req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    // Use direct select instead of query API to avoid column issues
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        accountType: users.accountType,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) return null;

    return user as AuthUser;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized. Please login.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, user);
  };
}

export function requireVendor(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized. Please login.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (user.accountType !== 'VENDOR') {
      return new Response(
        JSON.stringify({ message: 'This action is only available to vendors.' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return handler(req, user);
  };
}