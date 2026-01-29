// app/api/customer/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, userFavorites, vendorProfiles, eventCategories } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session')?.value;

  console.log('Favorites API - Auth token exists:', !!authToken);
  console.log('Favorites API - Session token exists:', !!sessionToken);

  if (authToken) {
    try {
      const payload = await verifyToken(authToken);
      console.log('Favorites API - Token payload:', payload);
      
      if (payload && payload.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId as number))
          .limit(1);
        
        console.log('Favorites API - User from token:', user ? { id: user.id, accountType: user.accountType } : null);
        return user;
      }
    } catch (error) {
      console.error('Favorites API - Token verification failed:', error);
    }
  }

  if (sessionToken) {
    console.log('Favorites API - Checking session token...');
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    console.log('Favorites API - Session found:', !!session);
    console.log('Favorites API - Session valid:', session && new Date(session.expiresAt) >= new Date());

    if (session && new Date(session.expiresAt) >= new Date()) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      
      console.log('Favorites API - User from session:', user ? { id: user.id, accountType: user.accountType } : null);
      return user;
    }
  }

  console.log('Favorites API - No user found');
  return null;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== Favorites GET Request ===');
    const user = await getCurrentUser();

    console.log('Favorites API - Final user:', user ? { id: user.id, accountType: user.accountType } : 'null');

    if (!user) {
      console.log('Favorites API - Returning 401 Unauthorized');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validCustomerTypes = ['CUSTOMER', 'C'];
    if (!validCustomerTypes.includes(user.accountType)) {
      console.log('Favorites API - Invalid account type:', user.accountType);
      return NextResponse.json(
        { success: false, error: 'Only customers can access favorites' },
        { status: 403 }
      );
    }

    console.log('Favorites API - Fetching favorites for user:', user.id);

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
      .where(eq(userFavorites.userId, user.id))
      .orderBy(desc(userFavorites.createdAt));

    console.log('Favorites API - Found favorites:', favoritesData.length);

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
    console.error('Favorites API - Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validCustomerTypes = ['CUSTOMER', 'C'];
    if (!validCustomerTypes.includes(user.accountType)) {
      return NextResponse.json(
        { success: false, error: 'Only customers can add favorites' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { vendorId } = body;

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
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
          eq(userFavorites.userId, user.id),
          eq(userFavorites.vendorId, vendorId)
        )
      )
      .limit(1);

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Vendor already in favorites' },
        { status: 400 }
      );
    }

    const [newFavorite] = await db
      .insert(userFavorites)
      .values({
        userId: user.id,
        vendorId: vendorId,
        createdAt: new Date(),
      })
      .returning();

    const [favoriteData] = await db
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
      .where(eq(userFavorites.id, newFavorite.id))
      .limit(1);

    return NextResponse.json({
      success: true,
      message: 'Vendor added to favorites',
      favorite: {
        id: favoriteData.favoriteId,
        vendorId: favoriteData.favoriteVendorId,
        createdAt: favoriteData.favoriteCreatedAt?.toISOString(),
        vendor: {
          id: favoriteData.vendorId,
          businessName: favoriteData.businessName,
          description: favoriteData.description,
          city: favoriteData.city,
          rating: favoriteData.rating,
          reviewCount: favoriteData.reviewCount,
          profileImage: favoriteData.profileImage,
          coverImage: favoriteData.coverImage,
          isVerified: favoriteData.isVerified,
        },
        category: favoriteData.categoryId
          ? {
              id: favoriteData.categoryId,
              name: favoriteData.categoryName,
            }
          : null,
        startingPrice: favoriteData.hourlyRate,
      },
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validCustomerTypes = ['CUSTOMER', 'C'];
    if (!validCustomerTypes.includes(user.accountType)) {
      return NextResponse.json(
        { success: false, error: 'Only customers can remove favorites' },
        { status: 403 }
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

    const [existingFavorite] = await db
      .select()
      .from(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, user.id),
          eq(userFavorites.vendorId, parseInt(vendorId))
        )
      )
      .limit(1);

    if (!existingFavorite) {
      return NextResponse.json(
        { success: false, error: 'Favorite not found' },
        { status: 404 }
      );
    }

    await db
      .delete(userFavorites)
      .where(
        and(
          eq(userFavorites.userId, user.id),
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