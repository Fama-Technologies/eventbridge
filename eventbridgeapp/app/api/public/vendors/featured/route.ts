import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices } from '@/drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db
      .select({
        vendorId: vendorProfiles.id,
        businessName: vendorProfiles.businessName,
        city: vendorProfiles.city,
        rating: vendorProfiles.rating,
        profileImage: vendorProfiles.profileImage,
        serviceName: vendorServices.name,
        price: vendorServices.price,
      })
      .from(vendorProfiles)
      .leftJoin(
        vendorServices,
        eq(vendorProfiles.id, vendorServices.vendorId)
      )
      .where(eq(vendorProfiles.isVerified, true))
      .orderBy(desc(vendorProfiles.rating))
      .limit(12);

    const map = new Map<string, any>();

    for (const row of rows) {
      if (!map.has(row.vendorId.toString())) {
        map.set(row.vendorId.toString(), {
          id: row.vendorId.toString(),
          businessName: row.businessName || 'Verified Vendor',
          category: row.serviceName || 'Event Service',
          location: row.city || 'Location not specified',
          availableDates: 'Check availability',
          pricePerDay: row.price
            ? `UGX ${row.price.toLocaleString()}`
            : 'Contact for pricing',
          rating: Number(row.rating) || 0,
          images: row.profileImage ? [row.profileImage] : ['/hero.jpg'],
        });
      }
    }

    return NextResponse.json(Array.from(map.values()).slice(0, 8));
  } catch (error) {
    console.error('Featured vendors error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
