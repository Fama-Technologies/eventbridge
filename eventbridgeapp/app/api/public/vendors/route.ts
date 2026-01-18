import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices } from '@/drizzle/schema';
import { and, desc, eq, ilike, or } from 'drizzle-orm';

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
        rating: vendorProfiles.rating,
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

    const map = new Map<string, any>();

    for (const row of rows) {
      const id = row.vendorId.toString();
      if (!map.has(id)) {
        const price = row.price ? row.price.toLocaleString() : '0';
        map.set(id, {
          id,
          name: row.businessName || 'Vendor',
          category: row.serviceName || 'Event Service',
          location: row.city || row.state || 'Location not specified',
          availability: 'Check availability',
          price,
          priceUnit: 'day',
          rating: Number(row.rating) || 0,
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
