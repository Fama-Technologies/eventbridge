import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MOCK_CATEGORIES = [
  {
    id: '1',
    name: 'DJ & Music',
    slug: 'dj-music',
    description: 'Professional DJs and music services for your events',
    imageUrl: '/categories/music.jpg',
    vendorCount: 24,
  },
  {
    id: '2',
    name: 'Photographer',
    slug: 'photographer',
    description: 'Capture your moments with professional photography',
    imageUrl: '/categories/photography.jpg',
    vendorCount: 45,
  },
  {
    id: '3',
    name: 'Catering',
    slug: 'catering',
    description: 'Delicious food and tailored menus for any occasion',
    imageUrl: '/categories/catering.jpg',
    vendorCount: 32,
  },
  {
    id: '4',
    name: 'Florist',
    slug: 'florist',
    description: 'Beautiful floral arrangements and bouquets',
    imageUrl: '/categories/flowers.jpg',
    vendorCount: 18,
  },
  {
    id: '5',
    name: 'Event Planner',
    slug: 'event-planner',
    description: 'Expert planning to make your event stress-free',
    imageUrl: '/categories/planning.jpg',
    vendorCount: 15,
  },
  {
    id: '6',
    name: 'Videographer',
    slug: 'videographer',
    description: 'Cinematic video coverage of your special day',
    imageUrl: '/categories/video.jpg',
    vendorCount: 28,
  },
  {
    id: '7',
    name: 'Venue',
    slug: 'venue',
    description: 'Perfect locations for weddings, parties, and corporate events',
    imageUrl: '/categories/venue.jpg',
    vendorCount: 50,
  },
  {
    id: '8',
    name: 'Decor',
    slug: 'decor',
    description: 'Stunning decorations to transform your venue',
    imageUrl: '/categories/decor.jpg',
    vendorCount: 36,
  },
  {
    id: '9',
    name: 'Engagements',
    slug: 'engagements',
    description: 'Everything you need for a perfect engagement party',
    imageUrl: '/categories/partners.jpg',
    vendorCount: 12,
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulate API delay if needed, or just return immediately
    return NextResponse.json(MOCK_CATEGORIES);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}