import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { createToken, isValidAccountType } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    // Query user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      console.log('Login attempt with non-existent email:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if account is active
    if (user.isActive === false) {
      return NextResponse.json({ message: 'Account is deactivated' }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password attempt for user:', user.email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    console.log('Login successful for user:', user.email);

    // Validate account type
    if (!isValidAccountType(user.accountType)) {
      console.error('Invalid account type in database:', user.accountType);
      return NextResponse.json({ message: 'Account configuration error' }, { status: 500 });
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
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
    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: userData, 
      token 
    }, { status: 200 });

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
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}