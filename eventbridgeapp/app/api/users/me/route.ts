import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Check for auth-token first (set by login), then session
    const authToken = cookieStore.get('auth-token')?.value;
    const sessionToken = cookieStore.get('session')?.value;

    if (authToken) {
      // Verify JWT token
      try {
        const payload = await verifyToken(authToken);
        if (payload && payload.userId) {
          const [user] = await db
            .select({
              id: users.id,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
              accountType: users.accountType,
              image: users.image,
            })
            .from(users)
            .where(eq(users.id, payload.userId as number))
            .limit(1);

          if (user) {
            return NextResponse.json(user);
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    if (sessionToken) {
      // Find session
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, sessionToken))
        .limit(1);

      if (session && new Date(session.expiresAt) >= new Date()) {
        // Get user
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            accountType: users.accountType,
            image: users.image,
          })
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        if (user) {
          return NextResponse.json(user);
        }
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
