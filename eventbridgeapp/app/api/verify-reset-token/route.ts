export const dynamic = 'force-dynamic'; 

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { passwordResetTokens } from '@/drizzle/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, message: 'Token is required' }, { status: 400 });
    }

    const resetToken = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      ),
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ valid: true, message: 'Token is valid' }, { status: 200 });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ valid: false, message: 'Internal server error' }, { status: 500 });
  }
}