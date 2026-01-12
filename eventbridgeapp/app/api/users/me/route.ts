import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
// Alternatively, you can use:
// export const revalidate = 0;

export async function GET() {
  try {
    // First check NextAuth session
    const nextAuthSession = await getServerSession(authOptions);

    if (nextAuthSession?.user?.id) {
      const userId = parseInt(nextAuthSession.user.id);
      const [result] = await db
        .select({
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            accountType: users.accountType,
            image: users.image,
            isActive: users.isActive,
            emailVerified: users.emailVerified,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          },
          vendorImage: vendorProfiles.profileImage,
          vendorId: vendorProfiles.id,
          phone: vendorProfiles.phone,
        })
        .from(users)
        .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
        .where(eq(users.id, userId))
        .limit(1);

      if (result && result.user) {
        const user = {
          ...result.user,
          image: result.vendorImage || result.user.image || null,
          phone: result.phone || null,
        };

        if (user.isActive) {
          return NextResponse.json(user);
        }

        if (!user.isActive) {
          return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
        }
      }
    }

    const cookieStore = await cookies();

    // Check for auth-token first (set by login), then session
    const authToken = cookieStore.get('auth-token')?.value;
    const sessionToken = cookieStore.get('session')?.value;

    if (authToken) {
      // Verify JWT token
      try {
        const payload = await verifyToken(authToken);
        if (payload && payload.userId) {
          const [result] = await db
            .select({
              user: {
                id: users.id,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                accountType: users.accountType,
                image: users.image,
                isActive: users.isActive,
                emailVerified: users.emailVerified,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
              },
              vendorImage: vendorProfiles.profileImage,
              vendorId: vendorProfiles.id,
              phone: vendorProfiles.phone,
            })
            .from(users)
            .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
            .where(eq(users.id, payload.userId))
            .limit(1);

          if (result && result.user) {
            const user = {
              ...result.user,
              image: result.vendorImage || result.user.image || null,
              phone: result.phone || null,
            };

            if (user.isActive) {
              return NextResponse.json(user);
            }

            if (!user.isActive) {
              return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
            }
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
        const [result] = await db
          .select({
            user: {
              id: users.id,
              email: users.email,
              firstName: users.firstName,
              lastName: users.lastName,
              accountType: users.accountType,
              image: users.image,
              isActive: users.isActive,
              emailVerified: users.emailVerified,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            },
            vendorImage: vendorProfiles.profileImage,
            vendorId: vendorProfiles.id,
            phone: vendorProfiles.phone,
          })
          .from(users)
          .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
          .where(eq(users.id, session.userId))
          .limit(1);

        if (result && result.user) {
          const user = {
            ...result.user,
            image: result.vendorImage || result.user.image || null,
            phone: result.phone || null,
          };

          if (user.isActive) {
            return NextResponse.json(user);
          }

          if (!user.isActive) {
            return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
          }
        }
      }
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
