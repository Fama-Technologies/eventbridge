// app/api/customer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFavorites, vendorProfiles, eventCategories } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// For demo purposes - using a hardcoded user ID
// In a real app, you'd get this from a session or token
const DEMO_USER_ID = 1; // Change this to match your test user ID

// GET - Fetch all favorites for the demo user
export async function GET(req: NextRequest) {
  try {
    console.log('=== GET FAVORITES API CALLED ===');

    // Fetch favorites with vendor details for demo user
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
      .where(eq(userFavorites.userId, DEMO_USER_ID));

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

    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    console.log('Adding favorite:', { userId: DEMO_USER_ID, vendorId });

    // Check if already favorited
    const existing = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, DEMO_USER_ID),
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
        userId: DEMO_USER_ID,
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

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    console.log('Removing favorite:', { userId: DEMO_USER_ID, vendorId });

    // Delete the favorite
    const deleted = await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, DEMO_USER_ID),
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