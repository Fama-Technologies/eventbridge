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
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
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
          const firstName = (profile as any)?.given_name || user.name?.split(' ')[0] || 'User';
          const lastName = (profile as any)?.family_name || user.name?.split(' ').slice(1).join(' ') || '';

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
            session_state: account.session_state as string ?? null,
          });
        }

        return true;
      } catch (error) {
        console.error('Google sign-in error:', error);
        return false;
      }
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
        (session.user as any).accountType = token.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER';
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };