import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
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
      return NextResponse.json(
        { 
          valid: false, 
          message: 'Invalid or expired reset token. Please request a new password reset.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { valid: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { valid: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}