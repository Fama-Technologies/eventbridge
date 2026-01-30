// app/api/customer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userFavorites, vendorProfiles, eventCategories } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const favoritesData = await db
      .select({
        favoriteId: userFavorites.id,
        favoriteVendorId: userFavorites.vendorId,
        favoriteCreatedAt: userFavorites.createdAt,
        vendorId: vendorProfiles.id,
        businessName: vendorProfiles.businessName,
        description: vendorProfiles.description,
        city: vendorProfiles.city,
        rating: vendorProfiles.rating,
        reviewCount: vendorProfiles.reviewCount,
        profileImage: vendorProfiles.profileImage,
        coverImage: vendorProfiles.coverImage,
        isVerified: vendorProfiles.isVerified,
        hourlyRate: vendorProfiles.hourlyRate,
        categoryId: eventCategories.id,
        categoryName: eventCategories.name,
      })
      .from(userFavorites)
      .leftJoin(vendorProfiles, eq(userFavorites.vendorId, vendorProfiles.id))
      .leftJoin(eventCategories, eq(vendorProfiles.categoryId, eventCategories.id))
      .where(eq(userFavorites.userId, parseInt(userId)))
      .orderBy(desc(userFavorites.createdAt));

    const formattedFavorites = favoritesData.map((fav: { favoriteId: any; favoriteVendorId: any; favoriteCreatedAt: { toISOString: () => any; }; vendorId: any; businessName: any; description: any; city: any; rating: any; reviewCount: any; profileImage: any; coverImage: any; isVerified: any; categoryId: any; categoryName: any; hourlyRate: any; }) => ({
      id: fav.favoriteId,
      vendorId: fav.favoriteVendorId,
      createdAt: fav.favoriteCreatedAt?.toISOString(),
      vendor: {
        id: fav.vendorId,
        businessName: fav.businessName,
        description: fav.description,
        city: fav.city,
        rating: fav.rating,
        reviewCount: fav.reviewCount,
        profileImage: fav.profileImage,
        coverImage: fav.coverImage,
        isVerified: fav.isVerified,
      },
      category: fav.categoryId
        ? {
            id: fav.categoryId,
            name: fav.categoryName,
          }
        : null,
      startingPrice: fav.hourlyRate,
    }));

    return NextResponse.json({
      success: true,
      favorites: formattedFavorites,
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vendorId, userId } = body;

    if (!vendorId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID and User ID are required' },
        { status: 400 }
      );
    }

    const [vendor] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.id, vendorId))
      .limit(1);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, userId),
          eq(userFavorites.vendorId, vendorId)
        )
      )
      .limit(1);

    if (existingFavorite) {
      return NextResponse.json(
        { success: true, message: 'Already in favorites', alreadyExists: true },
        { status: 200 }
      );
    }

    await db
      .insert(userFavorites)
      .values({
        userId: userId,
        vendorId: vendorId,
        createdAt: new Date(),
      });

    return NextResponse.json({
      success: true,
      message: 'Vendor added to favorites',
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');
    const userId = searchParams.get('userId');

    if (!vendorId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID and User ID are required' },
        { status: 400 }
      );
    }

    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, parseInt(userId)),
          eq(userFavorites.vendorId, parseInt(vendorId))
        )
      )
      .limit(1);

    if (!existingFavorite) {
      return NextResponse.json(
        { success: true, message: 'Favorite not found', notFound: true },
        { status: 200 }
      );
    }

    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, parseInt(userId)),
          eq(userFavorites.vendorId, parseInt(vendorId))
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Vendor removed from favorites',
    });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}