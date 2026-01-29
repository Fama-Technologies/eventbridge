// app/api/customer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFavorites, vendorProfiles, eventCategories, users } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

// For testing - use a specific user ID (update this to match your user ID)
const TEST_USER_ID = 1; // Change this to your actual user ID

// GET - Fetch all favorites for a user
export async function GET(req: NextRequest) {
  try {
    console.log('Fetching favorites from database...');

    // For now, use TEST_USER_ID. Later, get from session/token
    const userId = TEST_USER_ID;

    // Fetch favorites with vendor details
    const favorites = await db
      .select({
        favoriteId: userFavorites.id,
        createdAt: userFavorites.createdAt,
        vendor: {
          id: vendorProfiles.id,
          businessName: vendorProfiles.businessName,
          description: vendorProfiles.description,
          city: vendorProfiles.city,
          state: vendorProfiles.state,
          rating: vendorProfiles.rating,
          reviewCount: vendorProfiles.reviewCount,
          profileImage: vendorProfiles.profileImage,
          coverImage: vendorProfiles.coverImage,
          isVerified: vendorProfiles.isVerified,
          hourlyRate: vendorProfiles.hourlyRate,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
          }
        },
        category: {
          id: eventCategories.id,
          name: eventCategories.name,
        }
      })
      .from(userFavorites)
      .innerJoin(vendorProfiles, eq(userFavorites.vendorId, vendorProfiles.id))
      .innerJoin(users, eq(vendorProfiles.userId, users.id))
      .leftJoin(eventCategories, eq(vendorProfiles.categoryId, eventCategories.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));

    console.log(`Found ${favorites.length} favorites for user ${userId}`);

    // Transform the data to match your frontend expectations
    const formattedFavorites = favorites.map((fav: { favoriteId: any; vendor: { id: any; businessName: any; description: any; city: any; rating: any; reviewCount: any; profileImage: any; coverImage: any; isVerified: any; hourlyRate: any; user: any; }; createdAt: any; category: any; }) => ({
      id: fav.favoriteId,
      vendorId: fav.vendor.id,
      createdAt: fav.createdAt,
      vendor: {
        id: fav.vendor.id,
        businessName: fav.vendor.businessName,
        description: fav.vendor.description,
        city: fav.vendor.city,
        rating: fav.vendor.rating,
        reviewCount: fav.vendor.reviewCount,
        profileImage: fav.vendor.profileImage,
        coverImage: fav.vendor.coverImage,
        isVerified: fav.vendor.isVerified,
        hourlyRate: fav.vendor.hourlyRate,
        user: fav.vendor.user
      },
      category: fav.category,
      startingPrice: fav.vendor.hourlyRate
    }));

    return NextResponse.json({
      success: true,
      favorites: formattedFavorites,
      count: formattedFavorites.length
    });

  } catch (error: any) {
    console.error('Database error fetching favorites:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch favorites from database',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Add a vendor to favorites
export async function POST(req: NextRequest) {
  try {
    const { vendorId } = await req.json();
    
    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // For now, use TEST_USER_ID
    const userId = TEST_USER_ID;

    console.log(`Adding favorite: user ${userId}, vendor ${vendorId}`);

    // Check if already favorited
    const existingFavorite = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.vendorId, vendorId)
        )
      )
      .limit(1);

    if (existingFavorite.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Already in favorites',
          favoriteId: existingFavorite[0].id
        },
        { status: 400 }
      );
    }

    // Insert new favorite
    const [newFavorite] = await db
      .insert(userFavorites)
      .values({
        userId: userId,
        vendorId: vendorId,
        createdAt: new Date()
      })
      .returning();

    console.log('Added new favorite:', newFavorite);

    return NextResponse.json(
      {
        success: true,
        favorite: newFavorite,
        message: 'Added to favorites successfully'
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Database error adding favorite:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add favorite',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove a vendor from favorites
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // For now, use TEST_USER_ID
    const userId = TEST_USER_ID;

    console.log(`Removing favorite: user ${userId}, vendor ${vendorId}`);

    // Delete the favorite
    const deletedFavorites = await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.vendorId, parseInt(vendorId))
        )
      )
      .returning();

    if (deletedFavorites.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Favorite not found' 
        },
        { status: 404 }
      );
    }

    console.log('Removed favorite:', deletedFavorites[0]);

    return NextResponse.json(
      {
        success: true,
        message: 'Removed from favorites successfully',
        removedId: deletedFavorites[0].id
      }
    );

  } catch (error: any) {
    console.error('Database error removing favorite:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove favorite',
        details: error.message
      },
      { status: 500 }
    );
  }
}