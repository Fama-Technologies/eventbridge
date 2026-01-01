// lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER';
}

/* =========================
   NEXTAUTH OPTIONS
========================= */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.image,
          accountType: user.accountType,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!user.email || !account) return false;

        const email = user.email.toLowerCase();

        try {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          let userId: number;

          // Create user if not exists
          if (existingUser.length === 0) {
            const firstName =
              (profile as any)?.given_name ||
              user.name?.split(' ')[0] ||
              'User';
            const lastName =
              (profile as any)?.family_name ||
              user.name?.split(' ').slice(1).join(' ') ||
              '';

            const [newUser] = await db
              .insert(users)
              .values({
                email,
                firstName,
                lastName,
                image: user.image,
                provider: 'google',
                accountType: 'CUSTOMER',
                emailVerified: true,
                isActive: true,
              })
              .returning({ id: users.id });

            userId = newUser.id;
          } else {
            userId = existingUser[0].id;

            // Update user image if changed
            if (user.image && user.image !== existingUser[0].image) {
              await db
                .update(users)
                .set({
                  image: user.image,
                  emailVerified: true,
                })
                .where(eq(users.id, userId));
            }
          }

          // Ensure account exists
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(eq(accounts.providerAccountId, account.providerAccountId))
            .limit(1);

          if (existingAccount.length === 0) {
            await db.insert(accounts).values({
              userId,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token ?? null,
              access_token: account.access_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? null,
              scope: account.scope ?? null,
              id_token: account.id_token ?? null,
              session_state: (account.session_state as string) ?? null,
            });
          }

          return true;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        }
      }

      // For credentials provider
      return true;
    },

    async jwt({ token, user, account }) {
      // Initial sign in
      if (user?.email) {
        const dbUser = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            image: users.image,
            accountType: users.accountType,
          })
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (dbUser[0]) {
          token.userId = dbUser[0].id;
          token.email = dbUser[0].email;
          token.name = `${dbUser[0].firstName} ${dbUser[0].lastName}`;
          token.picture = dbUser[0].image;
          token.accountType = dbUser[0].accountType;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).accountType = token.accountType as
          | 'VENDOR'
          | 'CUSTOMER'
          | 'PLANNER';
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Invalid URL
      }

      // Check for redirect parameter
      try {
        const urlObj = new URL(url);
        const redirectParam = urlObj.searchParams.get('redirect');
        if (redirectParam) {
          return `${baseUrl}${redirectParam}`;
        }
      } catch (e) {
        // Invalid URL, ignore
      }

      return `${baseUrl}/dashboard`;
    },
  },
};

/* =========================
   API ROUTE AUTH (Request) - For JWT tokens
========================= */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
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
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER',
    };
  } catch (error) {
    console.error('getAuthUser error:', error);
    return null;
  }
}

/* =========================
   SERVER COMPONENT AUTH - For JWT tokens
========================= */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get('auth-token')?.value ??
      cookieStore.get('session_token')?.value;

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
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER',
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

/* =========================
   LOGIN RESPONSE - For JWT tokens
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