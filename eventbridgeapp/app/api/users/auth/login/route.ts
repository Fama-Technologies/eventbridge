import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { hash } from 'bcryptjs';

// GET — fetch all users
export async function GET() {
  const data = await db.select().from(users);
  return NextResponse.json(data);
}

// POST — create user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate account type
    if (body.accountType && !['VENDOR', 'CUSTOMER', 'PLANNER'].includes(body.accountType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid account type. Must be VENDOR, CUSTOMER, or PLANNER' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(body.password, 12);

    // Insert user with all required fields
    await db.insert(users).values({
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      accountType: body.accountType || 'CUSTOMER',
      provider: 'local',
      image: body.image || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
      emailVerified: body.emailVerified !== undefined ? body.emailVerified : false,
      // createdAt and updatedAt have default values in schema
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate email error
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}