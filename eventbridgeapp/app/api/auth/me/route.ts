import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    // Try NextAuth token first
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (token && token.userId) {
      const [user] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          accountType: users.accountType,
          image: users.image,
          isActive: users.isActive,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, Number(token.userId)))
        .limit(1);

      if (user && user.isActive) {
        return NextResponse.json({
          success: true,
          user: {
            ...user,
            name: `${user.firstName} ${user.lastName}`,
          },
        });
      }
    }

    // Try custom JWT token
    const authToken = req.cookies.get('auth-token')?.value;
    if (authToken) {
      try {
        const decoded = await verifyToken(authToken);
        
        if (!decoded || !decoded.userId) {
          return NextResponse.json(
            { success: false, message: 'Invalid token' },
            { status: 401 }
          );
        }

        const [user] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email,
            accountType: users.accountType,
            image: users.image,
            isActive: users.isActive,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (user && user.isActive) {
          return NextResponse.json({
            success: true,
            user: {
              ...user,
              name: `${user.firstName} ${user.lastName}`,
            },
          });
        }
      } catch (error) {
        console.error('JWT verification failed:', error);
      }
    }

    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}