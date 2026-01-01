import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (existingUser.length === 0) {
          const [newUser] = await db
            .insert(users)
            .values({
              email: user.email.toLowerCase(),
              firstName: user.name?.split(' ')[0] || '',
              lastName: user.name?.split(' ').slice(1).join(' ') || '',
              image: user.image,
              provider: 'google',
              accountType: 'CUSTOMER',
              emailVerified: true,
              isActive: true,
            })
            .returning();

          if (account && newUser) {
            await db.insert(accounts).values({
              userId: newUser.id,
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
        } else {
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(eq(accounts.userId, existingUser[0].id))
            .limit(1);

          if (existingAccount.length === 0 && account) {
            await db.insert(accounts).values({
              userId: existingUser[0].id,
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
        }

        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email!.toLowerCase()))
          .limit(1);

        if (dbUser[0]) {
          token.userId = dbUser[0].id.toString();
          token.email = dbUser[0].email;
          token.accountType = dbUser[0].accountType as 'VENDOR' | 'CUSTOMER';
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.accountType = token.accountType as 'VENDOR' | 'CUSTOMER';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const urlObj = new URL(url.startsWith('/') ? `${baseUrl}${url}` : url);
      const redirectParam = urlObj.searchParams.get('redirect');
      
      if (redirectParam) {
        return `${baseUrl}${redirectParam}`;
      }
      
      return baseUrl + '/dashboard';
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };