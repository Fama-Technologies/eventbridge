// app/api/customer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFavorites, users, vendorProfiles, eventCategories } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;
    
    console.log('Auth token present:', !!token);

    if (!token) {
      console.log('No auth token found');
      return null;
    }

    // Verify token
    const decoded = await verifyToken(token);
    console.log('Token decoded:', decoded);

    if (!decoded || !decoded.userId) {
      console.log('Invalid token or no userId');
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// GET - Fetch all favorites for the authenticated user
export async function GET(req: NextRequest) {
  try {
    console.log('=== GET FAVORITES API CALLED ===');

    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      console.log('User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    console.log('Fetching favorites for user:', userId);

    // Fetch favorites with vendor details
    const userFavoritesData = await db
      .select({
        id: userFavorites.id,
        vendorId: userFavorites.vendorId,
        createdAt: userFavorites.createdAt,
        vendor: {
          id: vendorProfiles.id,
          businessName: vendorProfiles.businessName,
          description: vendorProfiles.description,
          city: vendorProfiles.city,
          rating: vendorProfiles.rating,
          reviewCount: vendorProfiles.reviewCount,
          profileImage: vendorProfiles.profileImage,
          coverImage: vendorProfiles.coverImage,
          isVerified: vendorProfiles.isVerified,
        },
        category: {
          id: eventCategories.id,
          name: eventCategories.name,
        },
        startingPrice: vendorProfiles.hourlyRate,
      })
      .from(userFavorites)
      .leftJoin(vendorProfiles, eq(userFavorites.vendorId, vendorProfiles.id))
      .leftJoin(eventCategories, eq(vendorProfiles.categoryId, eventCategories.id))
      .where(eq(userFavorites.userId, userId));

    console.log('Found favorites:', userFavoritesData.length);

    return NextResponse.json(
      {
        success: true,
        favorites: userFavoritesData,
        count: userFavoritesData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch favorites'
      },
      { status: 500 }
    );
  }
}

// POST - Add a vendor to favorites
export async function POST(req: NextRequest) {
  try {
    console.log('=== ADD FAVORITE API CALLED ===');

    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    console.log('Adding favorite:', { userId, vendorId });

    // Check if already favorited
    const existing = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.vendorId, vendorId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Vendor already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    const [newFavorite] = await db
      .insert(userFavorites)
      .values({
        userId: userId,
        vendorId: vendorId,
        createdAt: new Date(),
      })
      .returning();

    console.log('Favorite added:', newFavorite);

    return NextResponse.json(
      {
        success: true,
        favorite: newFavorite,
        message: 'Added to favorites',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add favorite'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a vendor from favorites
export async function DELETE(req: NextRequest) {
  try {
    console.log('=== DELETE FAVORITE API CALLED ===');

    const userId = await getAuthenticatedUserId(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    console.log('Removing favorite:', { userId, vendorId });

    // Delete the favorite
    const deleted = await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.vendorId, parseInt(vendorId))
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    console.log('Favorite removed:', deleted);

    return NextResponse.json(
      {
        success: true,
        message: 'Removed from favorites',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove favorite'
      },
      { status: 500 }
    );
  }
}