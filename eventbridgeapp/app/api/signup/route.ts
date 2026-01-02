import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, password, accountType } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !accountType) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate account type (include ADMIN)
    if (!['VENDOR', 'CUSTOMER', 'PLANNER', 'ADMIN'].includes(accountType)) {
      return NextResponse.json(
        { message: 'Invalid account type. Must be VENDOR, CUSTOMER, PLANNER, or ADMIN' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Insert new user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        accountType: accountType as 'VENDOR' | 'CUSTOMER' | 'PLANNER' | 'ADMIN',
        provider: 'local',
        isActive: true,
        emailVerified: false,
      })
      .returning({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        accountType: users.accountType,
      });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          accountType: newUser.accountType,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack,
    });

    // Handle specific errors
    if (error.message?.includes('unique constraint') || error.code === '23505') {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error.message?.includes('connection') || error.message?.includes('timeout')) {
      return NextResponse.json(
        { message: 'Database connection failed. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}