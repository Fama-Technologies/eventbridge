import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, vendorProfiles, vendorPortfolio, sessions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

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

// GET all portfolio items for the vendor
export async function GET() {
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

    const portfolioItems = await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorProfile.id))
      .orderBy(vendorPortfolio.createdAt);

    return NextResponse.json({
      success: true,
      portfolio: portfolioItems
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Add new portfolio item
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      imageUrl,
      title,
      description,
      category,
      width,
      height,
      fileSize,
      quality,
      displayOrder = 0
    } = body;

    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Image URL is required' 
      }, { status: 400 });
    }

    const [newPortfolioItem] = await db
      .insert(vendorPortfolio)
      .values({
        vendorId: vendorProfile.id,
        imageUrl,
        title: title || null,
        description: description || null,
        category: category || null,
        width: width || null,
        height: height || null,
        fileSize: fileSize || null,
        quality: quality || null,
        displayOrder: displayOrder,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      portfolioItem: newPortfolioItem,
      message: 'Portfolio item added successfully'
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error'
    }, { status: 500 });
  }
}