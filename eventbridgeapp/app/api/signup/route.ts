// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, accountType } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !accountType) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate account type
    if (!['VENDOR', 'CUSTOMER', 'PLANNER'].includes(accountType)) {
      return NextResponse.json(
        { message: 'Invalid account type. Must be VENDOR, CUSTOMER, or PLANNER' },
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

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        accountType: accountType,
        provider: 'local',
        image: null,
        isActive: true,
        emailVerified: false,
      })
      .returning();

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
      name: error?.name,
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
    });

    // Handle specific database errors
    if (error?.message?.includes('unique constraint') || error?.message?.includes('duplicate key')) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error?.message?.includes('relation "users" does not exist')) {
      return NextResponse.json(
        { message: 'Database configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    if (error?.message?.includes('password')) {
      return NextResponse.json(
        { message: 'Password validation error. Please use a different password.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}