// app/api/public/by-category/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, users, eventCategories } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryIdNum = parseInt(categoryId);
    
    if (isNaN(categoryIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    // Get vendors in this category
    const vendors = await db
      .select({
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
        yearsExperience: vendorProfiles.yearsExperience,
        serviceRadius: vendorProfiles.serviceRadius,
        vendorUserId: vendorProfiles.userId,
        categoryName: eventCategories.name,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userImage: users.image,
      })
      .from(vendorProfiles)
      .innerJoin(users, eq(vendorProfiles.userId, users.id))
      .leftJoin(eventCategories, eq(vendorProfiles.categoryId, eventCategories.id))
      .where(
        and(
          eq(vendorProfiles.categoryId, categoryIdNum),
          eq(vendorProfiles.isVerified, true),
          eq(users.isActive, true)
        )
      )
      .orderBy(desc(vendorProfiles.rating))
      .limit(50);

    // Format the response
    const formattedVendors = vendors.map((vendor: any) => ({
      id: vendor.id,
      businessName: vendor.businessName,
      description: vendor.description,
      location: `${vendor.city}${vendor.state ? ', ' + vendor.state : ''}`,
      rating: vendor.rating || 0,
      reviewCount: vendor.reviewCount || 0,
      profileImage: vendor.profileImage || vendor.userImage,
      coverImage: vendor.coverImage,
      isVerified: vendor.isVerified,
      priceRange: vendor.hourlyRate ? 
        (vendor.hourlyRate < 100 ? '$' : vendor.hourlyRate < 300 ? '$$' : '$$$') : '$$',
      yearsExperience: vendor.yearsExperience || 0,
      serviceRadius: vendor.serviceRadius,
      category: vendor.categoryName || 'Uncategorized',
      vendorName: `${vendor.userFirstName} ${vendor.userLastName}`,
    }));

    return NextResponse.json({
      success: true,
      vendors: formattedVendors,
      count: formattedVendors.length,
    });

  } catch (error) {
    console.error('Error fetching vendors by category:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch category vendors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
