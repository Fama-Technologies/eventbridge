// app/api/categories/[slug]/vendors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, users, eventCategories } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Await the params promise
    const { slug } = await params;
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Convert slug back to category name
    const categoryName = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Get category
    const [category] = await db
      .select()
      .from(eventCategories)
      .where(eq(eventCategories.name, categoryName))
      .limit(1);

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Get vendors in this category
    // Note: You'll need to add a category field to vendorProfiles table
    // For now, getting all verified vendors
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
        isVerified: vendorProfiles.isVerified,
        userId: vendorProfiles.userId,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userImage: users.image,
      })
      .from(vendorProfiles)
      .leftJoin(users, eq(vendorProfiles.userId, users.id))
      .where(
        and(
          eq(vendorProfiles.isVerified, true)
          // Add category filter when you add the category field:
          // eq(vendorProfiles.category, categoryName)
        )
      )
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vendorProfiles)
      .where(eq(vendorProfiles.isVerified, true));

    const totalVendors = countResult?.count || 0;
    const totalPages = Math.ceil(totalVendors / limit);

    // Transform vendor data
    const formattedVendors = vendors.map((vendor: { id: any; businessName: string; userFirstName: any; userLastName: any; description: any; city: any; state: any; rating: any; reviewCount: any; profileImage: any; userImage: any; isVerified: any; }) => ({
      id: vendor.id,
      name: vendor.businessName || `${vendor.userFirstName} ${vendor.userLastName}`,
      businessName: vendor.businessName,
      description: vendor.description,
      location: vendor.city ? `${vendor.city}, ${vendor.state || ''}`.trim() : null,
      rating: vendor.rating || 0,
      reviewCount: vendor.reviewCount || 0,
      image: vendor.profileImage || vendor.userImage || '/images/default-vendor.jpg',
      verified: vendor.isVerified,
      slug: vendor.businessName?.toLowerCase().replace(/\s+/g, '-') || `vendor-${vendor.id}`,
    }));

    return NextResponse.json({
      success: true,
      category: {
        id: category.id,
        name: category.name,
        slug: slug, // Use the slug variable instead of params.slug
        description: category.description,
        icon: category.icon,
      },
      vendors: formattedVendors,
      pagination: {
        page,
        limit,
        totalVendors,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Get category vendors error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}