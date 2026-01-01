import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;

      const email = user.email.toLowerCase();

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!existingUser) {
        await db.insert(users).values({
          email,
          password: null,               // nullable (OAuth user)
          firstName: user.name?.split(' ')[0] ?? '',
          lastName: user.name?.split(' ').slice(1).join(' ') ?? '',
          image: user.image ?? null,
          provider: account.provider,   // REQUIRED (not null)
          accountType: 'CUSTOMER',       // REQUIRED (not null)
          isActive: true,
          emailVerified: true,
        });
      }

      return true;
    },
  },
});

export { handler as GET, handler as POST };
