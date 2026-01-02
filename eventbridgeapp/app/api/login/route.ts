import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createToken, isValidAccountType } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    console.log('Login request received');
    
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
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
      console.log('User not found:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Guard against users without a password (e.g. OAuth accounts)
    if (!user.password) {
      console.log('No password set (OAuth account):', user.email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', user.email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful for:', user.email);

    // Validate account type
    if (!isValidAccountType(user.accountType)) {
      console.error('Invalid account type:', user.accountType);
      return NextResponse.json(
        { success: false, message: 'Account configuration error' },
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

    // Determine redirect path based on account type
    const redirectTo = getRedirectPath(user.accountType);
    console.log('Redirecting to:', redirectTo);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token,
        redirectTo, // Added redirect path
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

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine redirect path based on account type
function getRedirectPath(accountType: string): string {
  const normalizedType = accountType.toLowerCase();
  
  switch (normalizedType) {
    case 'vendor':
      return '/vendor'; // Changed to /vendor (not /vendor/dashboard)
    case 'admin':
      return '/admin/dashboard';
    case 'customer':
      return '/dashboard';
    case 'planner':
      return '/planner/dashboard';
    default:
      console.warn('Unknown account type, defaulting to /dashboard:', accountType);
      return '/dashboard';
  }
}

// Optional: Add GET method to test the endpoint
export async function GET() {
  return NextResponse.json(
    { 
      success: true,
      message: 'Login endpoint is active',
      endpoint: '/api/login',
      method: 'POST',
      requiredFields: ['email', 'password'],
      redirectPaths: {
        vendor: '/vendor',
        admin: '/admin/dashboard',
        customer: '/dashboard',
        planner: '/planner/dashboard'
      }
    },
    { status: 200 }
  );
}