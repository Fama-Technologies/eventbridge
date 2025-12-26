import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateSecureToken, hashToken, isValidEmail } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    console.log('Password reset requested for:', email);

    // Generic message to prevent account enumeration
    const genericMessage = 'If an account with that email exists, you will receive a password reset link.';

    // Validate email format
    if (!email || !isValidEmail(email)) {
      console.log('Invalid email format');
      return NextResponse.json(
        { message: genericMessage, success: true },
        { status: 200 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    console.log('User found:', user ? 'Yes' : 'No');

    // Always return success to prevent email enumeration
    if (!user) {
      console.log('User not found, returning generic success');
      return NextResponse.json(
        { message: genericMessage, success: true },
        { status: 200 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('Account is deactivated');
      // Still return success to prevent enumeration
      return NextResponse.json(
        { message: genericMessage, success: true },
        { status: 200 }
      );
    }

    // Rate limiting: Check recent requests (max 3 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentRequests = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          gt(passwordResetTokens.createdAt, oneHourAgo)
        )
      );

    console.log('Recent reset requests:', recentRequests.length);

    if (recentRequests.length >= 3) {
      console.log('Rate limit exceeded');
      // Still return success to prevent enumeration
      return NextResponse.json(
        { message: genericMessage, success: true },
        { status: 200 }
      );
    }

    // Generate secure token (NOT HASHED - this is sent to user)
    const resetToken = generateSecureToken();
    
    // Hash the token for storage (ONLY HASH GOES IN DB)
    const tokenHash = hashToken(resetToken);
    
    console.log('Generated token (first 10 chars):', resetToken.substring(0, 10) + '...');
    console.log('Token hash (first 10 chars):', tokenHash.substring(0, 10) + '...');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    console.log('Token expires at:', expiresAt.toISOString());

    // Invalidate any existing unused tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          eq(passwordResetTokens.used, false)
        )
      );

    console.log('Invalidated previous tokens');

    // Save HASHED token to database
    const [savedToken] = await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        tokenHash: tokenHash,
        expiresAt: expiresAt,
        used: false,
      })
      .returning({ id: passwordResetTokens.id });

    console.log('Token saved to database, ID:', savedToken.id);

    // Create reset URL with PLAIN token (not hashed)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    console.log('Password reset link generated');

    // Send email
    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: resetUrl,
        userName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User',
        expiresAt: expiresAt,
      });
      console.log('Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Log but don't expose to user
    }

    // Return response
    return NextResponse.json(
      {
        message: genericMessage,
        success: true,
        // Only show reset URL in development
        ...(process.env.NODE_ENV === 'development' && { resetUrl }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { message: 'Internal server error. Please try again later.', success: false },
      { status: 500 }
    );
  }
}