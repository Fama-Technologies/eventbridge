import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { users, passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken, isStrongPassword } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword, confirmPassword } = body;

    console.log('🔄 Password reset attempt');

    // Validate inputs
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and password are required.' },
        { status: 400 }
      );
    }

    // Optional: Validate confirmPassword if your frontend sends it
    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&).',
        },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const tokenHash = hashToken(token);
    console.log('🔒 Verifying token hash...');

    // Find valid token - using direct select
    const [resetToken] = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
      })
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
      console.log('❌ Invalid or expired token');
      return NextResponse.json(
        {
          success: false,
          message: 'This reset link is invalid or has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    console.log('✅ Valid token found for user:', resetToken.userId);

    // Hash the new password (using bcryptjs with cost of 12)
    const hashedPassword = await hash(newPassword, 12);
    console.log('🔐 Password hashed');

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, resetToken.userId));

    console.log('✅ Password updated in database');

    // Mark token as used (IMPORTANT: prevents reuse)
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    console.log('✅ Token marked as used');

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully. You can now log in.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Password reset error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}