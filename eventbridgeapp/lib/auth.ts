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
    // Try multiple cookie names and Authorization header
    const token = req.cookies.get('auth-token')?.value || 
                  req.cookies.get('session_token')?.value ||
                  req.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token found in request');
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      console.log('Token verification failed');
      return null;
    }

    // Use direct select with proper column mapping
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

    if (!user) {
      console.log('User not found in database');
      return null;
    }

    // Convert database accountType to uppercase enum
    const accountType = user.accountType.toUpperCase() as 'VENDOR' | 'CUSTOMER';
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountType,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Helper to create auth response with cookie
export async function createAuthResponse(user: AuthUser) {
  const { createToken } = await import('@/lib/jwt');
  
  const token = await createToken({
    userId: user.id,
    email: user.email,
    accountType: user.accountType,
  });

  const response = new Response(JSON.stringify({ 
    success: true, 
    user,
    token 
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `auth-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`
    }
  });

  return response;
}

// Authentication middleware helpers
export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized. Please login.' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
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
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized. Please login.' 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    if (user.accountType !== 'VENDOR') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'This action is only available to vendors.' 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    return handler(req, user);
  };
}