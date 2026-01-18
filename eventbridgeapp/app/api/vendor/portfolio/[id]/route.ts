// app/api/vendor/portfolio/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, vendorProfiles, vendorPortfolio, sessions } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { unlink } from 'fs/promises';
import path from 'path';
import { del } from '@vercel/blob';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session')?.value;

  if (authToken) {
    try {
      const payload = await verifyToken(authToken);
      if (payload && payload.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId as number))
          .limit(1);
        return user;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  if (sessionToken) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (session && new Date(session.expiresAt) >= new Date()) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      return user;
    }
  }

  return null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Vendor only' },
        { status: 403 }
      );
    }

    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json(
        { success: false, error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    const portfolioId = parseInt(params.id);

    if (isNaN(portfolioId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid portfolio ID' },
        { status: 400 }
      );
    }

    const [portfolioItem] = await db
      .select()
      .from(vendorPortfolio)
      .where(
        and(
          eq(vendorPortfolio.id, portfolioId),
          eq(vendorPortfolio.vendorId, vendorProfile.id)
        )
      )
      .limit(1);

    if (!portfolioItem) {
      return NextResponse.json(
        { success: false, error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    // Delete from DB
    await db
      .delete(vendorPortfolio)
      .where(eq(vendorPortfolio.id, portfolioId));

    // Local file deletion
    try {
      if (portfolioItem.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(
          process.cwd(),
          'public',
          portfolioItem.imageUrl
        );
        await unlink(filePath);
      }
    } catch (error) {
      console.warn('Could not delete local file:', error);
    }

    // Blob storage deletion
    try {
      if (portfolioItem.imageUrl.startsWith('https://')) {
        await del(portfolioItem.imageUrl);
      }
    } catch (error) {
      console.warn('Blob deletion failed:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
