import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, vendorProfiles, vendorPortfolio, sessions } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
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
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    // Get vendor profile for this user
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    const portfolioId = parseInt(params.id);
    if (isNaN(portfolioId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid portfolio ID' 
      }, { status: 400 });
    }

    // First, get the portfolio item to check ownership and get image URL
    const [portfolioItem] = await db
      .select()
      .from(vendorPortfolio)
      .where(
        and(
          eq(vendorPortfolio.id, portfolioId),
          eq(vendorPortfolio.vendorId, vendorProfile.id) // Changed from userId to vendorId
        )
      )
      .limit(1);

    if (!portfolioItem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Portfolio item not found or unauthorized' 
      }, { status: 404 });
    }

    // Delete from Vercel Blob if URL exists
    if (portfolioItem.imageUrl) {
      try {
        await del(portfolioItem.imageUrl);
      } catch (blobError) {
        console.warn('Failed to delete from blob storage:', blobError);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // Delete from database
    await db
      .delete(vendorPortfolio)
      .where(
        and(
          eq(vendorPortfolio.id, portfolioId),
          eq(vendorPortfolio.vendorId, vendorProfile.id) // Changed from userId to vendorId
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    // Get vendor profile for this user
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    const portfolioId = parseInt(params.id);
    if (isNaN(portfolioId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid portfolio ID' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { 
      title,
      description,
      category,
      displayOrder
    } = body;

    // Check if portfolio item exists and belongs to this vendor
    const [existingItem] = await db
      .select()
      .from(vendorPortfolio)
      .where(
        and(
          eq(vendorPortfolio.id, portfolioId),
          eq(vendorPortfolio.vendorId, vendorProfile.id)
        )
      )
      .limit(1);

    if (!existingItem) {
      return NextResponse.json({ 
        success: false, 
        error: 'Portfolio item not found or unauthorized' 
      }, { status: 404 });
    }

    // Update the portfolio item
    const [updatedItem] = await db
      .update(vendorPortfolio)
      .set({
        title: title !== undefined ? title : existingItem.title,
        description: description !== undefined ? description : existingItem.description,
        category: category !== undefined ? category : existingItem.category,
        displayOrder: displayOrder !== undefined ? displayOrder : existingItem.displayOrder,
      })
      .where(
        and(
          eq(vendorPortfolio.id, portfolioId),
          eq(vendorPortfolio.vendorId, vendorProfile.id)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      portfolioItem: updatedItem,
      message: 'Portfolio item updated successfully'
    });
  } catch (error) {
    console.error('Update portfolio error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error'
    }, { status: 500 });
  }
}