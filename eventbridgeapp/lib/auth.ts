// lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';
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

/* =========================
   API ROUTE AUTH (Request)
========================= */
export async function getAuthUser(
  req: NextRequest
): Promise<AuthUser | null> {
  try {
    const token =
      req.cookies.get('auth-token')?.value ??
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

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

    return {
      ...user,
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER',
    };
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}

/* =========================
   SERVER COMPONENT AUTH
========================= */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token =
      cookies().get('auth-token')?.value ??
      cookies().get('session_token')?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

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

    return {
      ...user,
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER',
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

/* =========================
   LOGIN RESPONSE
========================= */
export async function createAuthResponse(user: AuthUser) {
  const token = await createToken({
    userId: user.id,
    email: user.email,
    accountType: user.accountType,
  });

  return new Response(
    JSON.stringify({
      success: true,
      user,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': [
          `auth-token=${token}`,
          'Path=/',
          'HttpOnly',
          'SameSite=Lax',
          `Max-Age=${7 * 24 * 60 * 60}`,
          process.env.NODE_ENV === 'production' ? 'Secure' : '',
        ]
          .filter(Boolean)
          .join('; '),
      },
    }
  );
}

/* =========================
   ROUTE GUARDS
========================= */
export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);

    if (!user) {
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
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
      return Response.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.accountType !== 'VENDOR') {
      return Response.json(
        {
          success: false,
          message: 'Vendor access only',
        },
        { status: 403 }
      );
    }

    return handler(req, user);
  };
}
