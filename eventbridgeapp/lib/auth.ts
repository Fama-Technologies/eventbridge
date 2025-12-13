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

    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        accountType: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) return null;

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