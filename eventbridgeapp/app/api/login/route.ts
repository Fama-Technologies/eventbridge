// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, deletedAccounts } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createToken, isValidAccountType } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      );
    }

    // Check if this email is in the deleted accounts table
    const [deletedAccount] = await db
      .select()
      .from(deletedAccounts)
      .where(eq(deletedAccounts.email, email.toLowerCase()))
      .limit(1);

    if (deletedAccount) {
      console.log('Attempted login to deleted account:', email);
      return NextResponse.json(
        { success: false, message: 'This account has been deleted' },
        { status: 410 } // 410 Gone - indicates resource permanently deleted
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!isValidAccountType(user.accountType)) {
      return NextResponse.json(
        { success: false, message: 'Account configuration error' },
        { status: 500 }
      );
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const redirectTo = getRedirectPath(user.accountType);

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          accountType: user.accountType,
          image: user.image,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        token,
        redirectTo,
      },
      { status: 200 }
    );

    console.log('Login successful for user:', user.email);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Setting auth-token cookie...');

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
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

function getRedirectPath(accountType: string): string {
  switch (accountType.toUpperCase()) {
    case 'VENDOR':
      return '/vendor';

    case 'ADMIN':
      return '/admin/dashboard';

    case 'CUSTOMER':
      return '/customer/dashboard';

    case 'PLANNER':
      return '/planner/dashboard';

    default:
      console.warn('Unknown account type:', accountType);
      return '/';
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Login endpoint is active',
      endpoint: '/api/login',
      vendorDashboard: '/vendor',
    },
    { status: 200 }
  );
}