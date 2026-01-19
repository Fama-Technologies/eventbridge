import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const filter = searchParams.get('filter') || 'all';

    // TODO: Implement database query to fetch actual activities
    // This should fetch from bookings, reviews, payments, etc. and combine them
    // Example:
    // const bookings = await db.select().from(bookings)...
    // const payments = ...
    // const sortedActivities = [...bookings, ...payments].sort(...)

    const activities: any[] = []; // Currently empty, waiting for DB implementation

    return NextResponse.json({
        success: true,
        activities: activities,
        pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            hasMore: false
        }
    });
}
