import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { vendorProfiles, vendorServices } from '@/drizzle/schema';
import { ilike, or, sql, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const CATEGORY_TEMPLATES = [
  {
    id: '1',
    name: 'DJ & Music',
    slug: 'dj',
    description: 'Professional DJs and music services for your events',
    imageUrl: '/categories/djs.jpg',
  },
  {
    id: '2',
    name: 'Photographer',
    slug: 'photographer',
    description: 'Capture your moments with professional photography',
    imageUrl: '/categories/photograher.jpg',
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
    imageUrl: '/categories/Florist.jpg',
  },
  {
    id: '5',
    name: 'Event Planner',
    slug: 'event-planner',
    description: 'Expert planning to make your event stress-free',
    imageUrl: '/categories/event planner.jpg',
  },
  {
    id: '6',
    name: 'Videographer',
    slug: 'videographer',
    description: 'Cinematic video coverage of your special day',
    imageUrl: '/categories/Videographer.jpg',
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
    name: 'Decorations',
    slug: 'decorations',
    description: 'Stunning decorations to transform your venue',
    imageUrl: '/categories/dec.jpg',
  },
  {
    id: '9',
    name: 'Engagements',
    slug: 'engagements',
    description: 'Everything you need for a perfect engagement party',
    imageUrl: '/categories/Engagements.jpg',
  },
  {
    id: '10',
    name: 'Weddings',
    slug: 'weddings',
    description: 'Everything you need for a perfect wedding',
    imageUrl: '/categories/weddings.jpg',
  },
  {
    id: '11',
    name: 'Birthdays',
    slug: 'birthdays',
    description: 'Everything you need for a perfect birthday',
    imageUrl: '/categories/Birthdays.jpg',
  },
  {
    id: '12',
    name: 'Baby Showers',
    slug: 'baby-showers',
    description: 'Everything you need for a perfect baby shower',
    imageUrl: '/categories/Baby Showers.png',
  },
  {
    id: '13',
    name: 'Graduations',
    slug: 'graduations',
    description: 'Everything you need for a perfect graduation',
    imageUrl: '/categories/Graduations.jpg',
  }, {
    id: '14',
    name: 'Corporate',
    slug: 'corporate',
    description: 'Everything you need for a perfect corporate event',
    imageUrl: '/categories/Corporate.jpg',
  }, {
    id: '15',
    name: 'Conferences',
    slug: 'conferences',
    description: 'Everything you need for a perfect conference',
    imageUrl: '/categories/Conferences.jpg',
  }, {
    id: '16',
    name: 'Funerals',
    slug: 'Funerals',
    description: 'Everything you need for a perfect Funerals for your beloved ones',
    imageUrl: '/categories/Funerals.jpg',
  }, {
    id: '17',
    name: 'Graduations',
    slug: 'Graduations',
    description: 'Let us help you plan your perfect graduation',
    imageUrl: '/categories/Graduations.jpg',
  }, {
    id: '18',
    name: 'Parties',
    slug: 'parties',
    description: 'Everything you need for a perfect party',
    imageUrl: '/categories/Parties.jpg',
  },
  {
    id: '19',
    name: 'Product Launchers',
    slug: 'product-launchers',
    description: 'Everything you need for a perfect product launch',
    imageUrl: '/categories/Product Launches.png',
  },
  {
    id: '20',
    name: 'Workshops',
    slug: 'workshops',
    description: 'Everything you need for a perfect workshop',
    imageUrl: '/categories/Workshops.jpg',
  }

];

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Categories API called');
    console.log('📊 Total category templates:', CATEGORY_TEMPLATES.length);

    // Return categories with vendorCount set to 0 for now
    // We can add vendor counting later once we confirm categories are displaying
    const categoriesWithCounts = CATEGORY_TEMPLATES.map(category => ({
      ...category,
      vendorCount: 0
    }));

    console.log('📊 Returning categories:', categoriesWithCounts.length);
    return NextResponse.json(categoriesWithCounts);
  } catch (error) {
    console.error('❌ Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}