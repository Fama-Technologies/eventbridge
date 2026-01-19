import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { vendorPortfolio, vendorProfiles, users } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper to get current user
async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1);
    
  return user || null;
}

// Helper to check if user owns the portfolio item
async function userOwnsPortfolioItem(userId: number, portfolioItemId: number): Promise<boolean> {
  const [portfolioItem] = await db
    .select({
      vendorId: vendorPortfolio.vendorId,
    })
    .from(vendorPortfolio)
    .innerJoin(vendorProfiles, eq(vendorPortfolio.vendorId, vendorProfiles.id))
    .where(and(
      eq(vendorPortfolio.id, portfolioItemId),
      eq(vendorProfiles.userId, userId)
    ))
    .limit(1);

  return !!portfolioItem;
}

// PUT: Update portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const portfolioItemId = Number(params.id);
    
    if (isNaN(portfolioItemId)) {
      return NextResponse.json(
        { error: 'Invalid portfolio item ID' },
        { status: 400 }
      );
    }

    // Check if user owns this portfolio item
    const ownsItem = await userOwnsPortfolioItem(user.id, portfolioItemId);
    
    if (!ownsItem) {
      return NextResponse.json(
        { error: 'You do not have permission to update this item' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, displayOrder } = body;

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title || null;
    if (description !== undefined) updateData.description = description || null;
    if (category !== undefined) updateData.category = category || null;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    updateData.updatedAt = new Date();

    // Update portfolio item
    const [updatedItem] = await db
      .update(vendorPortfolio)
      .set(updateData)
      .where(eq(vendorPortfolio.id, portfolioItemId))
      .returning();

    return NextResponse.json({
      success: true,
      portfolioItem: {
        id: updatedItem.id,
        imageUrl: updatedItem.imageUrl,
        title: updatedItem.title,
        description: updatedItem.description,
        category: updatedItem.category,
      },
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

// DELETE: Remove portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const portfolioItemId = Number(params.id);
    
    if (isNaN(portfolioItemId)) {
      return NextResponse.json(
        { error: 'Invalid portfolio item ID' },
        { status: 400 }
      );
    }

    // Check if user owns this portfolio item
    const ownsItem = await userOwnsPortfolioItem(user.id, portfolioItemId);
    
    if (!ownsItem) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this item' },
        { status: 403 }
      );
    }

    // Delete portfolio item
    await db
      .delete(vendorPortfolio)
      .where(eq(vendorPortfolio.id, portfolioItemId));

    return NextResponse.json({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}