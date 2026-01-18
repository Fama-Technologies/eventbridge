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
      conditions.push(
        or(
          ilike(vendorServices.name, `%${category}%`),
          ilike(vendorProfiles.businessName, `%${category}%`)
        )
      );
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

    const rows = await db
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

    const vendorIds = Array.from(new Set(rows.map((row) => row.vendorId)));

    const reviewStats = vendorIds.length
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
    reviewStats.forEach((row) => {
      ratingMap.set(row.vendorId, Number(row.avgRating) || 0);
    });

    const availabilityRows = vendorIds.length
      ? await db
          .select({
            vendorId: vendorAvailability.vendorId,
            activeDays: vendorAvailability.activeDays,
          })
          .from(vendorAvailability)
          .where(inArray(vendorAvailability.vendorId, vendorIds))
      : [];

    const availabilityMap = new Map<number, number[]>();
    availabilityRows.forEach((row) => {
      if (row.activeDays) availabilityMap.set(row.vendorId, row.activeDays);
    });

    const packageRows = vendorIds.length
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
    packageRows.forEach((row) => {
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
