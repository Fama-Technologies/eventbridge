import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch top rated vendors with their services
        // For now, we take vendors with rating >= 4 or just the latest ones
        const featuredData = await db
            .select({
                id: vendorProfiles.id,
                businessName: vendorProfiles.businessName,
                city: vendorProfiles.city,
                rating: vendorProfiles.rating,
                profileImage: vendorProfiles.profileImage,
                serviceName: vendorServices.name,
                price: vendorServices.price,
            })
            .from(vendorProfiles)
            .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
            .where(and(
                eq(vendorProfiles.isVerified, true),
                eq(vendorServices.isActive, true)
            ))
            .orderBy(desc(vendorProfiles.rating))
            .limit(8);

        // Group and format for the frontend
        // Expected: { id, businessName, category, location, availableDates, pricePerDay, rating, images }
        const formatted = featuredData.map((item: any) => ({
            id: item.id.toString(),
            businessName: item.businessName || 'Elite Vendor',
            category: item.serviceName || 'Premium Service',
            location: item.city || 'Location Hub',
            availableDates: 'Flexible Schedule',
            pricePerDay: item.price ? `UGX ${item.price.toLocaleString()}` : 'Contact for Price',
            rating: Number(item.rating) || 0,
            images: item.profileImage ? [item.profileImage] : ['/hero.jpg'], // fallback
        }));

        // Deduplicate by vendor id if necessary (since one vendor can have many services)
        const seen = new Set();
        const unique = formatted.filter((el: any) => {
            const duplicate = seen.has(el.id);
            seen.add(el.id);
            return !duplicate;
        }).slice(0, 4);

        return NextResponse.json(unique);
    } catch (error) {
        console.error('Featured vendors API error:', error);
        return NextResponse.json([], { status: 500 });
    }
}
