import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices, vendorPackages, vendorAvailability, reviews, vendorPortfolio } from '@/drizzle/schema';
import { and, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm';
import { formatAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Define row types for better TypeScript support
    type VendorServiceRow = {
      vendorId: number;
      businessName: string | null;
      city: string | null;
      profileImage: string | null;
      portfolioImage: string | null;
      serviceName: string | null;
      price: number | null;
    };

    const rows: VendorServiceRow[] = await db
      .select({
        vendorId: vendorProfiles.id,
        businessName: vendorProfiles.businessName,
        city: vendorProfiles.city,
        profileImage: vendorProfiles.profileImage,
        portfolioImage: vendorPortfolio.imageUrl,
        serviceName: vendorServices.name,
        price: vendorServices.price,
      })
      .from(vendorProfiles)
      .leftJoin(
        vendorServices,
        eq(vendorProfiles.id, vendorServices.vendorId)
      )
      .leftJoin(
        vendorPortfolio,
        eq(vendorProfiles.id, vendorPortfolio.vendorId)
      )
      .where(
        or(
          eq(vendorProfiles.isVerified, true),
          isNotNull(vendorPortfolio.id)
        )
      )
      .orderBy(desc(vendorProfiles.rating))
      .limit(12);

    // Cast vendorIds to number[] to satisfy TypeScript
    const vendorIds: number[] = Array.from(new Set(rows.map((row: VendorServiceRow) => row.vendorId)));

    // Define review stats row type
    type ReviewStatsRow = {
      vendorId: number;
      avgRating: number;
      reviewCount: number;
    };

    const reviewStats: ReviewStatsRow[] = vendorIds.length
      ? await db
          .select({
            vendorId: reviews.vendorId,
            avgRating: sql<number>`avg(${reviews.rating})`,
            reviewCount: sql<number>`count(${reviews.id})`,
          })
          .from(reviews)
          .where(inArray(reviews.vendorId, vendorIds))
          .groupBy(reviews.vendorId)
      : [];

    const ratingMap = new Map<number, { rating: number; reviewCount: number }>();
    reviewStats.forEach((row: ReviewStatsRow) => {
      ratingMap.set(row.vendorId, {
        rating: Number(row.avgRating) || 0,
        reviewCount: Number(row.reviewCount) || 0,
      });
    });

    // Define availability row type
    type AvailabilityRow = {
      vendorId: number;
      activeDays: number[] | null;
    };

    const availabilityRows: AvailabilityRow[] = vendorIds.length
      ? await db
          .select({
            vendorId: vendorAvailability.vendorId,
            activeDays: vendorAvailability.activeDays,
          })
          .from(vendorAvailability)
          .where(inArray(vendorAvailability.vendorId, vendorIds))
      : [];

    const availabilityMap = new Map<number, number[]>();
    availabilityRows.forEach((row: AvailabilityRow) => {
      if (row.activeDays) availabilityMap.set(row.vendorId, row.activeDays);
    });

    // Define package row type
    type PackageRow = {
      vendorId: number;
      minPrice: number;
    };

    const packageRows: PackageRow[] = vendorIds.length
      ? await db
          .select({
            vendorId: vendorPackages.vendorId,
            minPrice: sql<number>`min(${vendorPackages.price})`,
          })
          .from(vendorPackages)
          .where(and(inArray(vendorPackages.vendorId, vendorIds), eq(vendorPackages.isActive, true)))
          .groupBy(vendorPackages.vendorId)
      : [];

    const packagePriceMap = new Map<number, number>();
    packageRows.forEach((row: PackageRow) => {
      if (Number(row.minPrice) > 0) {
        packagePriceMap.set(row.vendorId, Number(row.minPrice));
      }
    });

    const map = new Map<string, any>();

    for (const row of rows) {
      if (!map.has(row.vendorId.toString())) {
        const availability = formatAvailability(availabilityMap.get(row.vendorId));
        const ratingData = ratingMap.get(row.vendorId);
        const rating = ratingData?.rating ?? 0;
        const servicePrice = row.price ?? packagePriceMap.get(row.vendorId) ?? null;
        const image =
          row.portfolioImage || row.profileImage || '/hero.jpg';
        map.set(row.vendorId.toString(), {
          id: row.vendorId.toString(),
          businessName: row.businessName || 'Verified Vendor',
          category: row.serviceName || 'Event Service',
          location: row.city || 'Location not specified',
          availableDates: availability,
          pricePerDay: servicePrice
            ? `UGX ${Number(servicePrice).toLocaleString()}`
            : 'Contact for pricing',
          rating,
          images: [image],
        });
      } else if (row.portfolioImage) {
        const existing = map.get(row.vendorId.toString());
        if (existing && existing.images?.[0] === '/hero.jpg') {
          existing.images = [row.portfolioImage];
        }
      }
    }

    // Transform the map values to match expected frontend structure
    const result = Array.from(map.values()).slice(0, 8).map(vendor => ({
      id: vendor.id,
      name: vendor.businessName,
      category: vendor.category,
      location: vendor.location,
      rating: vendor.rating,
      images: vendor.images,
      pricePerDay: vendor.pricePerDay,
      availableDates: vendor.availableDates,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Featured vendors error:', error);
    return NextResponse.json([], { status: 500 });
  }
}