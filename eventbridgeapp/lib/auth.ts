// lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';

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
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email.toLowerCase()))
          .limit(1);

        if (!user || !user.password) return null;

        const valid = await compare(credentials.password, user.password);
        if (!valid) return null;

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
    maxAge: 7 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true;
      if (!user.email) return false;

      const email = user.email.toLowerCase();

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: number;

      if (!existingUser) {
        const firstName =
          (profile as any)?.given_name || user.name?.split(' ')[0] || 'User';
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
            image: user.image ?? null,
            provider: 'google',
            accountType: 'CUSTOMER',
            emailVerified: true,
            isActive: true,
          })
          .returning({ id: users.id });

        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      // ✅ FIXED ACCOUNT LOOKUP (provider + providerAccountId)
      const [existingAccount] = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.provider, account.provider),
            eq(accounts.providerAccountId, account.providerAccountId)
          )
        )
        .limit(1);

      if (!existingAccount) {
        await db.insert(accounts).values({
          userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token ?? null,
          refresh_token: account.refresh_token ?? null,
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
          .select()
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (dbUser) {
          token.userId = dbUser.id;
          token.accountType = dbUser.accountType;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
          token.picture = dbUser.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
        (session.user as any).accountType = token.accountType;
      }
      return session;
    },

    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

/* =========================
   JWT AUTH (API)
========================= */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token =
      req.cookies.get('auth-token')?.value ??
      req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountType: user.accountType,
    };
  } catch {
    return null;
  }
}

/* =========================
   SERVER COMPONENT AUTH
========================= */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload?.userId) return null;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      accountType: user.accountType,
    };
  } catch {
    return null;
  }
}
