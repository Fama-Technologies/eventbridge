import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, vendorProfiles, bookings, reviews } from '@/drizzle/schema';
import { eq, desc, and, sql, gt } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Get vendors with the most bookings in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Type the query result explicitly
    type BookingStatsRow = {
      vendorId: number;
      bookingCount: number;
    };

    const rows = await db
      .select({
        vendorId: bookings.vendorId,
        bookingCount: sql<number>`count(*)`.as('bookingCount')
      })
      .from(bookings)
      .where(
        and(
          gt(bookings.createdAt, thirtyDaysAgo),
          eq(bookings.status, 'confirmed') // or whatever status indicates completed bookings
        )
      )
      .groupBy(bookings.vendorId)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(12);

    // Explicitly type the row parameter
    const vendorIds = Array.from(new Set(rows.map((row: BookingStatsRow) => row.vendorId)));

    // Type for review stats
    type ReviewStatsRow = {
      vendorId: number;
      avgRating: number;
      reviewCount: number;
    };

    const reviewStats: ReviewStatsRow[] = vendorIds.length
      ? await db
          .select({
            vendorId: bookings.vendorId,
            avgRating: sql<number>`coalesce(avg(reviews.rating), 0)`.as('avgRating'),
            reviewCount: sql<number>`count(reviews.id)`.as('reviewCount')
          })
          .from(bookings)
          .leftJoin(reviews, eq(reviews.bookingId, bookings.id))
          .where(eq(bookings.vendorId, sql.placeholder('vendorIds')))
          .groupBy(bookings.vendorId)
          .prepare()
          .execute({ vendorIds })
      : [];

    // Type for vendor data
    type VendorRow = {
      user: typeof users.$inferSelect;
      vendorProfile: typeof vendorProfiles.$inferSelect;
    };

    const featuredVendors: VendorRow[] = vendorIds.length
      ? await db
          .select({
            user: users,
            vendorProfile: vendorProfiles
          })
          .from(users)
          .innerJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
          .where(eq(users.id, sql.placeholder('vendorIds')))
          .prepare()
          .execute({ vendorIds })
      : [];

    // Combine all data
    type FeaturedVendorResult = VendorRow & {
      stats: {
        avgRating: number;
        reviewCount: number;
        recentBookingCount: number;
      };
    };

    const result: FeaturedVendorResult[] = featuredVendors.map((vendor: VendorRow) => {
      const stats = reviewStats.find((s: ReviewStatsRow) => s.vendorId === vendor.vendorProfile.id);
      const bookingRow = rows.find((r: BookingStatsRow) => r.vendorId === vendor.vendorProfile.id);
      
      return {
        ...vendor,
        stats: {
          avgRating: stats?.avgRating || 0,
          reviewCount: stats?.reviewCount || 0,
          recentBookingCount: bookingRow?.bookingCount || 0
        }
      };
    });

    // Sort by recent booking count
    result.sort((a, b) => (b.stats.recentBookingCount || 0) - (a.stats.recentBookingCount || 0));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching featured vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured vendors' },
      { status: 500 }
    );
  }
}