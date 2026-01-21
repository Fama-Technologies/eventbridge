import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices, vendorPackages, vendorAvailability, reviews, vendorPortfolio } from '@/drizzle/schema';
import { and, desc, eq, inArray, isNotNull, or, sql } from 'drizzle-orm';
import { formatAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Step 1: Get distinct featured vendors (verified OR with portfolio) - MAX 4
    const featuredVendors = await db
      .selectDistinctOn([vendorProfiles.id], {
        id: vendorProfiles.id,
        businessName: vendorProfiles.businessName,
        city: vendorProfiles.city,
        profileImage: vendorProfiles.profileImage,
        rating: vendorProfiles.rating,
      })
      .from(vendorProfiles)
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
      .orderBy(vendorProfiles.id, desc(vendorProfiles.rating))
      .limit(4); // Only get 4 vendors maximum

    const vendorIds = featuredVendors.map((v: { id: any; }) => v.id);

    // If we have vendors, get their related data
    if (vendorIds.length === 0) {
      return NextResponse.json([]);
    }

    // Step 2: Get services for these vendors
    const vendorServicesData = await db
      .select({
        vendorId: vendorServices.vendorId,
        name: vendorServices.name,
        price: vendorServices.price,
      })
      .from(vendorServices)
      .where(inArray(vendorServices.vendorId, vendorIds));

    // Step 3: Get portfolio images
    const portfolioImages = await db
      .select({
        vendorId: vendorPortfolio.vendorId,
        imageUrl: vendorPortfolio.imageUrl,
      })
      .from(vendorPortfolio)
      .where(inArray(vendorPortfolio.vendorId, vendorIds));

    // Step 4: Get reviews
    const reviewStats = await db
      .select({
        vendorId: reviews.vendorId,
        avgRating: sql<number>`avg(${reviews.rating})`,
        reviewCount: sql<number>`count(${reviews.id})`,
      })
      .from(reviews)
      .where(inArray(reviews.vendorId, vendorIds))
      .groupBy(reviews.vendorId);

    const ratingMap = new Map();
    reviewStats.forEach((row: { vendorId: any; avgRating: any; reviewCount: any; }) => {
      ratingMap.set(row.vendorId, {
        rating: Number(row.avgRating) || 0,
        reviewCount: Number(row.reviewCount) || 0,
      });
    });

    // Step 5: Get availability
    const availabilityRows = await db
      .select({
        vendorId: vendorAvailability.vendorId,
        activeDays: vendorAvailability.activeDays,
      })
      .from(vendorAvailability)
      .where(inArray(vendorAvailability.vendorId, vendorIds));

    const availabilityMap = new Map();
    availabilityRows.forEach((row: { activeDays: any; vendorId: any; }) => {
      if (row.activeDays) availabilityMap.set(row.vendorId, row.activeDays);
    });

    // Step 6: Get packages
    const packageRows = await db
      .select({
        vendorId: vendorPackages.vendorId,
        minPrice: sql<number>`min(${vendorPackages.price})`,
      })
      .from(vendorPackages)
      .where(and(
        inArray(vendorPackages.vendorId, vendorIds),
        eq(vendorPackages.isActive, true)
      ))
      .groupBy(vendorPackages.vendorId);

    const packagePriceMap = new Map();
    packageRows.forEach((row: { minPrice: any; vendorId: any; }) => {
      if (Number(row.minPrice) > 0) {
        packagePriceMap.set(row.vendorId, Number(row.minPrice));
      }
    });

    // Step 7: Assemble the response - MAX 4 vendors
    const result = featuredVendors.map((vendor: { id: { toString: () => any; }; businessName: any; city: any; rating: any; profileImage: any; }) => {
      // Get primary service for this vendor
      const vendorService = vendorServicesData.find((s: { vendorId: { toString: () => any; }; }) => s.vendorId === vendor.id);
      // Get portfolio image for this vendor
      const portfolioImage = portfolioImages.find((p: { vendorId: { toString: () => any; }; }) => p.vendorId === vendor.id);
      // Get rating data
      const ratingData = ratingMap.get(vendor.id);
      // Get availability
      const availability = formatAvailability(availabilityMap.get(vendor.id));
      // Get price
      const servicePrice = vendorService?.price ?? packagePriceMap.get(vendor.id) ?? null;

      return {
        id: vendor.id.toString(),
        businessName: vendor.businessName || 'Verified Vendor',
        category: vendorService?.name || 'Event Service',
        location: vendor.city || 'Location not specified',
        availableDates: availability,
        pricePerDay: servicePrice
          ? `UGX ${Number(servicePrice).toLocaleString()}`
          : 'Contact for pricing',
        rating: ratingData?.rating || vendor.rating || 0,
        images: [portfolioImage?.imageUrl || vendor.profileImage || '/hero.jpg'],
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Featured vendors error:', error);
    return NextResponse.json([], { status: 500 });
  }
}