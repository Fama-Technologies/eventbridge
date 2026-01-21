import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices } from '@/drizzle/schema';
import { ilike, or, sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const CATEGORY_TEMPLATES = [
  {
    id: '1',
    name: 'DJ & Music',
    slug: 'dj-music',
    description: 'Professional DJs and music services for your events',
    imageUrl: '/categories/djs.jpg',
  },
  {
    id: '2',
    name: 'Photographer',
    slug: 'photographer',
    description: 'Capture your moments with professional photography',
    imageUrl: '/categories/photography.jpg',
  },
  {
    id: '3',
    name: 'Catering',
    slug: 'catering',
    description: 'Delicious food and tailored menus for any occasion',
    imageUrl: '/categories/catering.jpg',
  },
  {
    id: '4',
    name: 'Florist',
    slug: 'florist',
    description: 'Beautiful floral arrangements and bouquets',
    imageUrl: '/categories/flowers.jpg',
  },
  {
    id: '5',
    name: 'Event Planner',
    slug: 'event-planner',
    description: 'Expert planning to make your event stress-free',
    imageUrl: '/categories/planning.jpg',
  },
  {
    id: '6',
    name: 'Videographer',
    slug: 'videographer',
    description: 'Cinematic video coverage of your special day',
    imageUrl: '/categories/video.jpg',
  },
  {
    id: '7',
    name: 'Venue',
    slug: 'venue',
    description: 'Perfect locations for weddings, parties, and corporate events',
    imageUrl: '/categories/venue.jpg',
  },
  {
    id: '8',
    name: 'Decor',
    slug: 'decor',
    description: 'Stunning decorations to transform your venue',
    imageUrl: '/categories/decor.jpg',
  },
  {
    id: '9',
    name: 'Engagements',
    slug: 'engagements',
    description: 'Everything you need for a perfect engagement party',
    imageUrl: '/categories/partners.jpg',
  },
  {
    id: '10',
    name: 'Wedding',
    slug: 'wedding',
    description: 'Everything you need for a perfect engagement party',
    imageUrl: '/categories/partners.jpg',
  },
];

export async function GET(request: NextRequest) {
  try {
    // Fetch vendor counts for each category from the database
    const categoriesWithCounts = await Promise.all(
      CATEGORY_TEMPLATES.map(async (category) => {
        try {
          // Count vendors that have services matching this category
          const result = await db
            .select({
              count: sql<number>`COUNT(DISTINCT ${vendorProfiles.id})`,
            })
            .from(vendorProfiles)
            .leftJoin(vendorServices, eq(vendorProfiles.id, vendorServices.vendorId))
            .where(
              or(
                ilike(vendorServices.name, `%${category.slug.replace('-', ' ')}%`),
                ilike(vendorServices.name, `%${category.name}%`),
                ilike(vendorProfiles.businessName, `%${category.name}%`)
              )
            );

          const vendorCount = result[0]?.count ? Number(result[0].count) : 0;

          return {
            ...category,
            vendorCount,
          };
        } catch (error) {
          console.error(`Error counting vendors for category ${category.slug}:`, error);
          return {
            ...category,
            vendorCount: 0,
          };
        }
      })
    );

    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}