// lib/auth.ts - UPDATED VERSION (no type declarations)
import { NextRequest } from 'next/server';
import { verifyToken, createToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users, accounts, deletedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { getToken } from 'next-auth/jwt';

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

        const email = credentials.email.toLowerCase();

        // Check if account was deleted
        const [deletedAccount] = await db
          .select()
          .from(deletedAccounts)
          .where(eq(deletedAccounts.email, email))
          .limit(1);

        if (deletedAccount) {
          throw new Error('This account has been deleted. Please contact support if you believe this is an error.');
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user || !user.password) return null;

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Your account has been deactivated.');
        }

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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return true;

      const email = user.email.toLowerCase();

      // Check if user previously deleted their account
      const [deletedAccount] = await db
        .select()
        .from(deletedAccounts)
        .where(eq(deletedAccounts.email, email))
        .limit(1);

      if (deletedAccount) {
        console.log(`Blocked login attempt for deleted account: ${email}`);
        return false;
      }

      if (account?.provider !== 'google') return true;

      let accountType: 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN' = 'CUSTOMER';

      // Check for pending account type from sessionStorage (passed from frontend)
      const pendingAccountType = (user as any).pendingAccountType;
      if (pendingAccountType && ['VENDOR', 'CUSTOMER', 'PLANNER', 'ADMIN'].includes(pendingAccountType)) {
        accountType = pendingAccountType;
      }

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
            accountType,
            emailVerified: true,
            isActive: true,
          })
          .returning({ id: users.id });

        userId = created.id;
      } else {
        // Check if existing user is active
        if (!existing[0].isActive) {
          console.log(`Blocked login for inactive account: ${email}`);
          return false;
        }

        userId = existing[0].id;
        // Update account type if it was passed
        if (pendingAccountType) {
          await db.update(users)
            .set({ accountType })
            .where(eq(users.id, userId));
        }
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

    async jwt({ token, user, account }) {
      if (user) {
        // Add account type from user object
        token.accountType = (user as any).accountType || 'CUSTOMER';
        
        // If this is a Google sign-in and we have pending account type
        if (account?.provider === 'google' && (user as any).pendingAccountType) {
          token.accountType = (user as any).pendingAccountType;
        }

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
          token.userId = String(dbUser.id);
          token.email = dbUser.email;
          token.name = `${dbUser.firstName} ${dbUser.lastName}`;
          token.picture = dbUser.image;
          token.accountType = dbUser.accountType;
        }
      }

      // On every token refresh, verify user still exists and is active
      if (token.email) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, token.email as string))
          .limit(1);

        // If user was deleted or deactivated, invalidate token
        if (!existingUser || !existingUser.isActive) {
          return {} as any;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId && token.email && token.name && token.accountType) {
        session.user.id = token.userId;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.accountType = token.accountType;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Handle redirects based on account type
      if (url.startsWith('/')) {
        // Check if it's a specific redirect
        if (url.includes('callbackUrl')) {
          return url;
        }
        return `${baseUrl}${url}`;
      }
      
      if (new URL(url).origin === baseUrl) return url;
      
      // Default redirect
      return `${baseUrl}/dashboard`;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

/* =========================
   AUTH USER HELPERS
========================= */
export async function getAuthUser(
  req: NextRequest | any
): Promise<AuthUser | null> {
  // Try NextAuth token first
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token && token.userId && token.email && token.name && token.accountType) {
    const name = token.name;
    const [firstName, ...rest] = name?.split(' ') ?? [];
    
    return {
      id: Number(token.userId),
      email: token.email,
      firstName: firstName || '',
      lastName: rest.join(' '),
      accountType: token.accountType,
    };
  }

  // Fallback: Check for custom auth-token
  let customToken: string | undefined;

  if (req.cookies.get && typeof req.cookies.get === 'function') {
    const cookie = req.cookies.get('auth-token');
    customToken = cookie?.value || cookie;
  } else if (req.cookies['auth-token']) {
    customToken = req.cookies['auth-token'];
  } else if (Array.isArray(req.cookies)) {
    const cookie = req.cookies.find((c: any) => c.name === 'auth-token');
    customToken = cookie?.value;
  }

  if (customToken) {
    const payload = await verifyToken(customToken);
    if (payload) {
      // Extract name from token or use separate firstName/lastName
      const name = (payload as any).name || '';
      const [firstName, ...rest] = name.split(' ');
      
      return {
        id: payload.userId,
        email: payload.email,
        firstName: (payload as any).firstName || firstName || '',
        lastName: (payload as any).lastName || rest.join(' ') || '',
        accountType: payload.accountType,
      };
    }
  }

  return null;
}

/* =========================
BACKWARD COMPAT EXPORT
========================= */
export const getCurrentUser = getAuthUser;