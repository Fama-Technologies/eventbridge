// app/api/signup-fixed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  console.log('=== SIGNUP FIXED ENDPOINT CALLED ===');
  
  try {
    const body = await req.json();
    console.log('Request body received');
    
    const { firstName, lastName, email, password, accountType } = body;
    
    console.log('Parsed fields:', { email, accountType, hasFirstName: !!firstName, hasLastName: !!lastName });

    // Validate
    if (!firstName || !lastName || !email || !password || !accountType) {
      console.log('Validation failed - missing fields');
      return NextResponse.json(
        { 
          message: 'All fields are required',
          received: { firstName: !!firstName, lastName: !!lastName, email: !!email, password: !!password, accountType: !!accountType }
        },
        { status: 400 }
      );
    }

    if (!['VENDOR', 'CUSTOMER', 'PLANNER'].includes(accountType)) {
      console.log('Invalid account type:', accountType);
      return NextResponse.json(
        { message: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check database URL
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is missing');
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Database URL exists, connecting...');

    try {
      const sql = neon(process.env.DATABASE_URL);
      
      // First, ensure users table exists
      console.log('Ensuring users table exists...');
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
      console.log('Users table ensured');

      // Check for existing user
      console.log('Checking for existing email:', email.toLowerCase());
      const existing = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase()}
      `;
      
      if (existing.length > 0) {
        console.log('User already exists');
        return NextResponse.json(
          { message: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      console.log('Hashing password...');
      const hashedPassword = await hash(password, 12);
      console.log('Password hashed');

      // Insert user
      console.log('Inserting user...');
      const result = await sql`
        INSERT INTO users (
          email, password, first_name, last_name, 
          account_type, provider, is_active, email_verified
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

      const newUser = result[0];
      console.log('User created successfully:', newUser.id);

      return NextResponse.json({
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          email: newUser.email,
          accountType: newUser.account_type,
        },
      }, { status: 201 });

    } catch (dbError: any) {
      console.error('Database error:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail
      });
      
      return NextResponse.json({
        message: 'Database error',
        error: dbError.message,
        code: dbError.code
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Signup fatal error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}