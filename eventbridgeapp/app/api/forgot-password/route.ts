// app/api/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log(' Password reset requested for:', email);

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    console.log('👤 User found:', user ? 'Yes' : 'No');

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(' User not found, returning generic success');
      return NextResponse.json(
        { 
          message: 'If an account with that email exists, you will receive a password reset link.',
          success: true 
        },
        { status: 200 }
      );
    }

    // Generate secure random token using Web Crypto API
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const resetToken = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    console.log('Generated token:', resetToken.substring(0, 10) + '...');

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    console.log('Token expires at:', expiresAt.toISOString());

    // Save token to database
    const [savedToken] = await db.insert(passwordResetTokens).values({
      userId: user.id,
      token: resetToken,
      expiresAt: expiresAt,
      used: false,
    }).returning();

    console.log('Token saved to database, ID:', savedToken.id);

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl);
    console.log('For user:', user.email);

    return NextResponse.json(
      { 
        message: 'If an account with that email exists, you will receive a password reset link.',
        success: true,
        // Show reset URL in development mode only
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}