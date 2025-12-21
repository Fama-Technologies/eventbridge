export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';
import { hashToken } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    console.log('Verifying token...');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    if (token.length !== 64) {
      console.log('Invalid token length:', token.length);
      return NextResponse.json(
        { valid: false, message: 'Invalid reset token format.' },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const tokenHash = hashToken(token);
    console.log('🔒 Token hash generated');

    // Check if token exists, is not used, and not expired
    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!resetToken) {
      console.log('Token not found or expired');
      return NextResponse.json(
        { valid: false, message: 'This reset link is invalid or has expired.' },
        { status: 400 }
      );
    }

    console.log('Token is valid');
    return NextResponse.json(
      { valid: true, message: 'Token is valid.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, message: 'An error occurred.' },
      { status: 500 }
    );
  }
}