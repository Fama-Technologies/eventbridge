import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, accounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

type AccountType = 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email.toLowerCase()),
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          accountType: user.accountType as AccountType,
          image: user.image || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('=== SIGN IN CALLBACK START ===');
        console.log('Provider:', account?.provider);
        console.log('User email:', user.email);

        if (account?.provider === 'google') {
          const email = user.email;
          if (!email) {
            console.error('No email provided by Google');
            return false;
          }

          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase()),
          });

          console.log('Existing user found:', !!existingUser);

          if (!existingUser) {
            console.log('Creating new user with account type: CUSTOMER');

            const googleProfile = profile as {
              given_name?: string;
              family_name?: string;
              picture?: string;
            } | undefined;

            const firstName = googleProfile?.given_name || user.name?.split(' ')[0] || 'User';
            const lastName = googleProfile?.family_name || user.name?.split(' ').slice(1).join(' ') || '';

            const newUserData = {
              email: email.toLowerCase(),
              firstName: firstName,
              lastName: lastName,
              accountType: 'CUSTOMER' as const,
              provider: 'google' as const,
              emailVerified: true as const,
              image: user.image || null,
              isActive: true as const,
              password: null as null,
            };

            const [newUser] = await db.insert(users).values(newUserData).returning();

            console.log('New user created:', {
              id: newUser.id,
              email: newUser.email,
              provider: newUser.provider,
              accountType: newUser.accountType
            });

            await db.insert(accounts).values({
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token || null,
              access_token: account.access_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: (account.session_state as string) || null,
            });

            console.log('Account record created for user:', newUser.id);
          } else {
            console.log('User already exists:', {
              id: existingUser.id,
              email: existingUser.email,
              provider: existingUser.provider
            });

            const existingAccount = await db.query.accounts.findFirst({
              where: eq(accounts.userId, existingUser.id),
            });

            if (!existingAccount) {
              console.log('Creating account link for existing user');
              await db.insert(accounts).values({
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token || null,
                access_token: account.access_token || null,
                expires_at: account.expires_at || null,
                token_type: account.token_type || null,
                scope: account.scope || null,
                id_token: account.id_token || null,
                session_state: (account.session_state as string) || null,
              });
            }
          }
        }

        console.log('=== SIGN IN CALLBACK END ===');
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async jwt({ token, user }) {
      console.log('=== JWT CALLBACK ===');

      if (user) {
        token.id = user.id;
        token.accountType = user.accountType as AccountType;
        console.log('Set token from user:', { id: token.id, accountType: token.accountType });
      }

      if (!token.accountType && token.email) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, token.email as string),
            columns: {
              accountType: true,
              id: true,
            },
          });
          
          if (dbUser) {
            token.accountType = dbUser.accountType as AccountType;
            token.id = dbUser.id.toString();
            console.log('Fetched token from DB:', { id: token.id, accountType: token.accountType });
          }
        } catch (error) {
          console.error('Error fetching user accountType:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      console.log('=== SESSION CALLBACK ===');
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accountType = token.accountType as AccountType;
        console.log('Session user:', { id: session.user.id, accountType: session.user.accountType });
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK ===');
      console.log('URL:', url);
      console.log('Base URL:', baseUrl);

      // Allow specific vendor paths like onboarding
      if (url.includes('/vendor/onboarding')) {
        return `${baseUrl}/vendor/onboarding`;
      }

      // For signup redirect to vendor onboarding
      if (url.includes('signup?type=vendor')) {
        return `${baseUrl}/vendor/onboarding`;
      }

      // For other vendor URLs, go to dashboard
      if (url.includes('vendor') || url.includes('accountType=VENDOR')) {
        return `${baseUrl}/vendor/dashboard`;
      }
      
      if (url.includes('customer') || url.includes('accountType=CUSTOMER')) {
        return `${baseUrl}/dashboard`;
      }

      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('Sign in event:', { 
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser 
      });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
