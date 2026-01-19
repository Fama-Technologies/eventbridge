import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';
import { vendorPortfolio, vendorProfiles, users, userUploads } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

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

// GET: Fetch portfolio items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorIdParam = searchParams.get('vendorId');
    
    let vendorProfileId: number | null = null;

    // If vendorId is provided in query, use it
    if (vendorIdParam) {
      vendorProfileId = Number(vendorIdParam);
    } else {
      // Otherwise, get portfolio for current user
      const user = await getCurrentUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Get vendor profile for current user
      const [vendorProfile] = await db
        .select()
        .from(vendorProfiles)
        .where(eq(vendorProfiles.userId, user.id))
        .limit(1);

      if (!vendorProfile) {
        return NextResponse.json(
          { success: true, portfolio: [] },
          { status: 200 }
        );
      }

      vendorProfileId = vendorProfile.id;
    }

    if (!vendorProfileId) {
      return NextResponse.json(
        { success: true, portfolio: [] },
        { status: 200 }
      );
    }

    // Fetch portfolio items
    const portfolioItems = await db
      .select({
        id: vendorPortfolio.id,
        imageUrl: vendorPortfolio.imageUrl,
        title: vendorPortfolio.title,
        description: vendorPortfolio.description,
        category: vendorPortfolio.category,
        width: vendorPortfolio.width,
        height: vendorPortfolio.height,
        fileSize: vendorPortfolio.fileSize,
        quality: vendorPortfolio.quality,
        displayOrder: vendorPortfolio.displayOrder,
        createdAt: vendorPortfolio.createdAt,
      })
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorProfileId))
      .orderBy(desc(vendorPortfolio.displayOrder), desc(vendorPortfolio.createdAt));

    return NextResponse.json({
      success: true,
      portfolio: portfolioItems,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}

// POST: Create new portfolio item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get vendor profile for current user
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { imageUrl, title, description, category, pathname, size, type } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Get the highest display order for this vendor
    const [latestItem] = await db
      .select({ displayOrder: vendorPortfolio.displayOrder })
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorProfile.id))
      .orderBy(desc(vendorPortfolio.displayOrder))
      .limit(1);

    const nextDisplayOrder = (latestItem?.displayOrder || 0) + 1;

    // Create portfolio item
    const [portfolioItem] = await db
      .insert(vendorPortfolio)
      .values({
        vendorId: vendorProfile.id,
        imageUrl,
        title: title || null,
        description: description || null,
        category: category || null,
        displayOrder: nextDisplayOrder,
        width: null,
        height: null,
        fileSize: size || null,
        quality: null,
        createdAt: new Date(),
      })
      .returning();

    // Also save to user_uploads table for tracking (if pathname exists)
    if (pathname) {
      const fileName = pathname.split('/').pop() || 'portfolio.jpg';
      
      await db.insert(userUploads).values({
        userId: user.id,
        vendorId: vendorProfile.id,
        fileKey: pathname,
        fileUrl: imageUrl,
        fileName: fileName,
        fileType: type || 'image/jpeg',
        fileSize: size || 0,
        uploadType: 'gallery',
        width: null,
        height: null,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      portfolioItem: {
        id: portfolioItem.id,
        imageUrl: portfolioItem.imageUrl,
        title: portfolioItem.title,
        description: portfolioItem.description,
        category: portfolioItem.category,
      },
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}