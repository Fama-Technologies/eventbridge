import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices, vendorPackages, vendorAvailability, reviews } from '@/drizzle/schema';
import { and, desc, eq, ilike, or, inArray, sql } from 'drizzle-orm';
import { formatAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const limit = Number(searchParams.get('limit') || 24);

    const conditions: any[] = [];

    if (category) {
      const categoryConditions = [
        ilike(vendorServices.name, `%${category}%`),
        ilike(vendorProfiles.businessName, `%${category}%`)
      ];

      // Handle plural/singular mismatch (e.g. category "weddings" searching for "Wedding Service")
      // Simple heuristic: if ends with 's', try removing it
      if (category.toLowerCase().endsWith('s')) {
        const singular = category.slice(0, -1);
        categoryConditions.push(ilike(vendorServices.name, `%${singular}%`));
        categoryConditions.push(ilike(vendorProfiles.businessName, `%${singular}%`));
      }

      conditions.push(or(...categoryConditions));
    }

    if (search) {
      conditions.push(
        or(
          ilike(vendorServices.name, `%${search}%`),
          ilike(vendorProfiles.businessName, `%${search}%`),
          ilike(vendorProfiles.description, `%${search}%`)
        )
      );
    }

    if (location) {
      conditions.push(
        or(
          ilike(vendorProfiles.city, `%${location}%`),
          ilike(vendorProfiles.state, `%${location}%`),
          ilike(vendorProfiles.address, `%${location}%`)
        )
      );
    }

    // Define type for vendor service row
    type VendorServiceRow = {
      vendorId: number;
      businessName: string | null;
      city: string | null;
      state: string | null;
      profileImage: string | null;
      coverImage: string | null;
      serviceName: string | null;
      price: number | null;
    };

    const rows: VendorServiceRow[] = await db
      .select({
        vendorId: vendorProfiles.id,
        businessName: vendorProfiles.businessName,
        city: vendorProfiles.city,
        state: vendorProfiles.state,
        profileImage: vendorProfiles.profileImage,
        coverImage: vendorProfiles.coverImage,
        serviceName: vendorServices.name,
        price: vendorServices.price,
      })
      .from(vendorProfiles)
      .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(vendorProfiles.rating))
      .limit(Number.isFinite(limit) ? limit : 24);

    // Explicitly type vendorIds as number[]
    const vendorIds: number[] = Array.from(new Set(rows.map((row: VendorServiceRow) => row.vendorId)));

    // Define type for review stats row
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

    const ratingMap = new Map<number, number>();
    reviewStats.forEach((row: ReviewStatsRow) => {
      ratingMap.set(row.vendorId, Number(row.avgRating) || 0);
    });

    // Define type for availability row
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

    // Define type for package row
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
      const id = row.vendorId.toString();
      if (!map.has(id)) {
        const availability = formatAvailability(availabilityMap.get(row.vendorId));
        const servicePrice = row.price ?? packagePriceMap.get(row.vendorId) ?? null;
        const price = servicePrice ? Number(servicePrice).toLocaleString() : '0';
        map.set(id, {
          id,
          name: row.businessName || 'Vendor',
          category: row.serviceName || 'Event Service',
          location: row.city || row.state || 'Location not specified',
          availability,
          price,
          priceUnit: 'day',
          rating: ratingMap.get(row.vendorId) || 0,
          images: [row.profileImage || row.coverImage || '/categories/placeholder.jpg'],
        });
      }
    }

    return NextResponse.json(Array.from(map.values()));
  } catch (error) {
    console.error('Public vendors error:', error);
    return NextResponse.json([], { status: 500 });
  }
}