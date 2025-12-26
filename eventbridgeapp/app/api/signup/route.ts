// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
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

    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL);

    // Check if users table exists, create if not
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          image TEXT,
          provider TEXT NOT NULL DEFAULT 'local',
          account_type TEXT NOT NULL,
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL
        )
      `;
    } catch (tableError: any) {
      console.error('Error creating table:', tableError);
      // Continue anyway, table might already exist
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Insert new user
    const newUser = await sql`
      INSERT INTO users (
        email,
        password,
        first_name,
        last_name,
        account_type,
        provider,
        is_active,
        email_verified
      ) VALUES (
        ${email.toLowerCase()},
        ${hashedPassword},
        ${firstName.trim()},
        ${lastName.trim()},
        ${accountType},
        'local',
        true,
        false
      ) RETURNING id, email, first_name, last_name, account_type
    `;

    const user = newUser[0];

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          accountType: user.account_type,
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

    if (error.message?.includes('relation "users" does not exist')) {
      return NextResponse.json(
        { message: 'Database setup incomplete. Please try again.' },
        { status: 500 }
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