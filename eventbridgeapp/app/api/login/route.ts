// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createToken, isValidAccountType } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Query user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      console.log('Login attempt with non-existent email:', email);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.isActive === false) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Guard against users without a password (e.g. OAuth accounts)
    if (!user.password) {
      console.log('Password login attempted for OAuth-only account:', user.email);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password attempt for user:', user.email);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful for user:', user.email);

    // Validate account type
    if (!isValidAccountType(user.accountType)) {
      console.error('Invalid account type in database:', user.accountType);
      return NextResponse.json(
        { message: 'Account configuration error' },
        { status: 500 }
      );
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Prepare user data for response
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      image: user.image,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    // Create response
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userData,
        token,
        redirectTo: getRedirectPath(user.accountType), // Add redirect path
      },
      { status: 200 }
    );

    // Set authentication cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set a non-httpOnly cookie for client-side account type detection
    // This helps with immediate redirect after login
    response.cookies.set('user-account-type', user.accountType, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60, // 60 seconds - just enough for redirect
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine redirect path based on account type
function getRedirectPath(accountType: string): string {
  switch (accountType.toLowerCase()) {
    case 'vendor':
      return '/vendor/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'user':
    default:
      return '/dashboard';
  }
}

// Optional: GET method to check auth status
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 200 }
      );
    }

    // You might want to verify the token here
    // const decoded = await verifyToken(token);
    
    return NextResponse.json(
      { isAuthenticated: true },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 200 }
    );
  }
}