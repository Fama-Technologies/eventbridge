// lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

/* =========================
TYPES
========================= */
export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';
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
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);

        if (!user || !user.password) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: String(user.id),
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
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google' || !user.email) return true;

      const email = user.email.toLowerCase();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: number;

      if (existing.length === 0) {
        const firstName =
          (profile as any)?.given_name ??
          user.name?.split(' ')[0] ??
          'User';

        const lastName =
          (profile as any)?.family_name ??
          user.name?.split(' ').slice(1).join(' ') ??
          '';

        const [created] = await db
          .insert(users)
          .values({
            email,
            firstName,
            lastName,
            image: user.image ?? null,
            provider: 'google',
            accountType: 'CUSTOMER',
            emailVerified: true,
            isActive: true,
          })
          .returning({ id: users.id });

        userId = created.id;
      } else {
        userId = existing[0].id;
      }

      const linked = await db
        .select()
        .from(accounts)
        .where(eq(accounts.providerAccountId, account.providerAccountId))
        .limit(1);

      if (linked.length === 0) {
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
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const [dbUser] = await db
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

        if (dbUser) {
          token.userId = dbUser.id;
          token.email = dbUser.email;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
          token.picture = dbUser.image;
          token.accountType = dbUser.accountType;
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
        (session.user as any).accountType = token.accountType;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/* =========================
   JWT AUTH HELPERS
========================= */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token =
    req.cookies.get('auth-token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userId) return null;

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
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token =
    cookieStore.get('auth-token')?.value ??
    cookieStore.get('session_token')?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload?.userId) return null;

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

  return user ? (user as AuthUser) : null;
}

/* =========================
RESPONSE + GUARDS
========================= */
export async function createAuthResponse(user: AuthUser) {
  const token = await createToken({
    userId: user.id,
    email: user.email,
    accountType: user.accountType,
  });

  return new Response(JSON.stringify({ success: true, user }), {
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
  });
}

export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return handler(req, user);
  };
}

export function requireVendor(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user || user.accountType !== 'VENDOR') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }
    return handler(req, user);
  };
}

export function requireAdmin(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req);
    if (!user || user.accountType !== 'ADMIN') {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }
    return handler(req, user);
  };
}
