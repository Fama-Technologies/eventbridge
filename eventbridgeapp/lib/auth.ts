// lib/auth.ts
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, createToken } from '@/lib/jwt';
import { db } from '@/lib/db';
import { users, accounts, sessions } from '@/drizzle/schema';
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
        if (!user.email || !account) {
          console.error('Missing user email or account');
          return '/login?error=missing_info';
        }

        const email = user.email.toLowerCase();

        try {
          console.log('Google sign-in attempt for:', email);
          
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

            console.log('Creating new user:', { email, firstName, lastName });

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
            console.log('Created user with ID:', userId);
          } else {
            userId = existingUser[0].id;
            console.log('Found existing user with ID:', userId);

            // Update user image and verification if changed
            if (user.image && user.image !== existingUser[0].image) {
              await db
                .update(users)
                .set({
                  image: user.image,
                  emailVerified: true,
                  updatedAt: new Date(),
                })
                .where(eq(users.id, userId));
              console.log('Updated user image and verification');
            }
          }

          // Ensure account link exists
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(eq(accounts.providerAccountId, account.providerAccountId))
            .limit(1);

          if (existingAccount.length === 0) {
            console.log('Creating account link for user:', userId);
            
            await db.insert(accounts).values({
              userId: userId,
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
            
            console.log('Account link created successfully');
          } else {
            console.log('Account link already exists');
          }

          console.log('Google sign-in successful for user:', userId);
          return true;
        } catch (error) {
          console.error('Error in Google sign-in callback:', error);
          console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
          return '/login?error=callback_error';
        }
      }

      // For credentials provider
      return true;
    },

    async jwt({ token, user }) {
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
          
          console.log('JWT created for user:', dbUser[0].id, 'Account type:', dbUser[0].accountType);
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
          | 'PLANNER'
          | 'ADMIN';
          
        console.log('Session created for user:', token.userId, 'Account type:', token.accountType);
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('Redirect callback - URL:', url, 'Base URL:', baseUrl);

      // Parse the URL to check for callbackUrl
      try {
        const urlObj = new URL(url, baseUrl);
        const callbackUrl = urlObj.searchParams.get('callbackUrl');
        
        if (callbackUrl && callbackUrl.startsWith('/')) {
          console.log('Using callbackUrl:', callbackUrl);
          return `${baseUrl}${callbackUrl}`;
        }
      } catch (e) {
        // Invalid URL, continue with default logic
      }

      // Allows relative callback URLs
      if (url.startsWith('/')) {
        console.log('Redirecting to relative URL:', url);
        return `${baseUrl}${url}`;
      }

      // Allows callback URLs on the same origin
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('Redirecting to same origin URL:', url);
          return url;
        }
      } catch {
        // Invalid URL
      }

      // Default redirect to dashboard
      console.log('Redirecting to default dashboard');
      return `${baseUrl}/dashboard`;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('SignIn event triggered:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });
    },
  },

  debug: process.env.NODE_ENV === 'development',
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
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN',
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
      accountType: user.accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN',
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

export function requireAdmin(
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

    if (user.accountType !== 'ADMIN') {
      return Response.json(
        {
          success: false,
          message: 'Admin access only',
        },
        { status: 403 }
      );
    }

    return handler(req, user);
  };
}