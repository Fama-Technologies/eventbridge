import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    console.log('Password reset attempt');

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required', success: false },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long', success: false },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const tokenHash = hashToken(token);

    // Find the token in database
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      console.log('Invalid or expired token');
      return NextResponse.json(
        { 
          message: 'Invalid or expired reset token. Please request a new password reset.', 
          success: false 
        },
        { status: 400 }
      );
    }

    console.log('Token valid, updating password for user:', resetToken.userId);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, resetToken.userId));

    console.log('Password updated successfully');

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    console.log('Token marked as used');

    return NextResponse.json(
      { 
        message: 'Password reset successful. You can now login with your new password.', 
        success: true 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.', success: false },
      { status: 500 }
    );
  }
}