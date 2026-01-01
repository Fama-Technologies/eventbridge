import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
    async signIn({ user, account }) {
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
          const firstName = user.name?.split(' ')[0] ?? '';
          const lastName = user.name?.split(' ').slice(1).join(' ') ?? '';

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
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state,
          });
        }

        return true;
      } catch (error) {
        console.error('Google sign-in error:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await db
          .select({
            id: users.id,
            email: users.email,
            accountType: users.accountType,
          })
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (dbUser[0]) {
          token.userId = dbUser[0].id;
          token.email = dbUser[0].email;
          token.accountType = dbUser[0].accountType;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = String(token.userId);
        session.user.email = token.email as string;
        session.user.accountType = token.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER';
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      const resolvedUrl = url.startsWith('/')
        ? new URL(url, baseUrl)
        : new URL(url);

      const redirectParam = resolvedUrl.searchParams.get('redirect');

      if (redirectParam) {
        return `${baseUrl}${redirectParam}`;
      }

      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
