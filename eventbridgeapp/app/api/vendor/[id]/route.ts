import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  vendorProfiles,
  users,
  vendorServices,
  vendorPackages,
  vendorPortfolio,
  vendorAvailability,
  reviews
} from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import { formatAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = Number(params.id);

    if (Number.isNaN(vendorId)) {
      return NextResponse.json(
        { error: 'Invalid vendor ID' },
        { status: 400 }
      );
    }

    /* ---------------- Vendor profile ---------------- */
    const vendorData = await db
      .select({
        id: vendorProfiles.id,
        userId: vendorProfiles.userId,
        businessName: vendorProfiles.businessName,
        description: vendorProfiles.description,
        phone: vendorProfiles.phone,
        website: vendorProfiles.website,
        address: vendorProfiles.address,
        city: vendorProfiles.city,
        state: vendorProfiles.state,
        zipCode: vendorProfiles.zipCode,
        yearsExperience: vendorProfiles.yearsExperience,
        hourlyRate: vendorProfiles.hourlyRate,
        isVerified: vendorProfiles.isVerified,
        profileImage: vendorProfiles.profileImage,
        coverImage: vendorProfiles.coverImage,
        userFirstName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
      })
      .from(vendorProfiles)
      .leftJoin(users, eq(vendorProfiles.userId, users.id))
      .where(eq(vendorProfiles.id, vendorId))
      .limit(1);

    if (!vendorData.length) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const vendor = vendorData[0];

    /* ---------------- Services ---------------- */
    const services = await db
      .select()
      .from(vendorServices)
      .where(eq(vendorServices.vendorId, vendorId));

    /* ---------------- Packages ---------------- */
    const packages = await db
      .select()
      .from(vendorPackages)
      .where(eq(vendorPackages.vendorId, vendorId));

    /* ---------------- Portfolio images ---------------- */
    const portfolio = await db
      .select()
      .from(vendorPortfolio)
      .where(eq(vendorPortfolio.vendorId, vendorId));

    /* ---------------- Availability ---------------- */
    const [availability] = await db
      .select({
        activeDays: vendorAvailability.activeDays,
      })
      .from(vendorAvailability)
      .where(eq(vendorAvailability.vendorId, vendorId))
      .limit(1);

    /* ---------------- Reviews ---------------- */
    const [reviewStats] = await db
      .select({
        avgRating: sql<number>`avg(${reviews.rating})`,
        reviewCount: sql<number>`count(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.vendorId, vendorId));

    const rating = Number(reviewStats?.avgRating) || 0;
    const reviewCount = Number(reviewStats?.reviewCount) || 0;

    // Fetch actual reviews with user data
    const recentReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.comment,
        date: reviews.createdAt,
        author: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
        avatar: users.image,
        location: vendorProfiles.city, // Using vendor city as proxy or we could join with user profile if separate
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.clientId, users.id))
      .leftJoin(vendorProfiles, eq(reviews.vendorId, vendorProfiles.id))
      .where(eq(reviews.vendorId, vendorId))
      .orderBy(sql`${reviews.createdAt} desc`)
      .limit(5);

    /* ---------------- Response shape (matches VendorData) ---------------- */
    return NextResponse.json({
      id: vendor.id.toString(),
      name: vendor.businessName || `${vendor.userFirstName} ${vendor.userLastName}`,
      category: services[0]?.name || 'Event Services',
      location: vendor.city || 'Kampala',
      country: vendor.state || 'Uganda',
      rating,
      reviewCount,
      isVerified: vendor.isVerified ?? false,
      startingPrice: vendor.hourlyRate || 0,
      priceUnit: 'event',
      yearsExperience: vendor.yearsExperience || 0,
      responseTime: '<1h',
      availability: formatAvailability(availability?.activeDays),
      guestCapacity: '100+',
      description: vendor.description || '',
      images:
        portfolio.length > 0
          ? portfolio.map((p: any) => p.imageUrl)
          : [vendor.coverImage || vendor.profileImage || '/categories/weddings.jpg'],
      portfolio: portfolio.map((p: any) => ({
        id: p.id,
        src: p.imageUrl,
        category: p.category || 'All Photos',
      })),
      reviews: recentReviews.map((r: any) => ({
        id: r.id.toString(),
        author: r.author || 'Anonymous',
        avatar: r.avatar || '/avatars/default.jpg',
        location: r.location || 'Kampala',
        date: r.date ? new Date(r.date).toLocaleDateString() : '',
        text: r.text || '',
        rating: r.rating || 5,
      })),
      packages: packages.map((pkg: any) => ({
        id: pkg.id.toString(),
        name: pkg.name,
        description: pkg.description || '',
        price: pkg.price || 0,
        priceType: pkg.price && pkg.price > 0 ? 'fixed' : 'custom',
        features: (pkg.features as string[]) || [],
        badge: pkg.isPopular ? 'Popular' : undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
