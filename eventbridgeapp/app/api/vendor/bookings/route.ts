import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, events, users, vendorProfiles } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get vendor profile for the user
        const vendor = await db.query.vendorProfiles.findFirst({
            where: eq(vendorProfiles.userId, user.id),
        });

        if (!vendor) {
            return NextResponse.json({ bookings: [] });
        }

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit');

        // Query bookings
        let query = db
            .select({
                id: bookings.id,
                eventName: events.title,
                clientName: users.firstName, // Simplified for now
                clientLastName: users.lastName,
                date: bookings.bookingDate,
                startTime: bookings.startTime,
                endTime: bookings.endTime,
                location: events.location,
                status: bookings.status,
                amount: bookings.totalAmount,
                // We'll need to join package/service for more details if needed
            })
            .from(bookings)
            .leftJoin(events, eq(bookings.eventId, events.id))
            .leftJoin(users, eq(bookings.clientId, users.id))
            .where(eq(bookings.vendorId, vendor.id))
            .orderBy(desc(bookings.bookingDate));

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const results = await query;

        const formattedBookings = results.map((b: any) => ({
            id: b.id.toString(),
            eventName: b.eventName || "Event",
            clientName: `${b.clientName} ${b.clientLastName}`,
            date: b.date ? new Date(b.date).toLocaleDateString() : 'TBD',
            time: b.startTime ? new Date(b.startTime).toLocaleTimeString() : 'TBD',
            location: b.location || 'TBD',
            status: b.status,
            amount: b.amount || 0,
            package: "Standard Package" // Placeholder as package join is complex
        }));

        return NextResponse.json({ bookings: formattedBookings });

    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // POST remains mock-ish or basic because implementing full booking creation flow 
    // with all relations (event, client, service) is complex for this step.
    // For now, we return error as this should likely go through a proper flow.
    // Or we can keep it fake for UI testing if user wants ONLY GET to be real.
    // User said "remove all fake apis", but creating a booking requires valid relations.
    // I will return a 501 Not Implemented to be safe/honest, or basic mock if needed.
    // Given "remove fake apis", I'll return Not Implemented to force real flow usage or subsequent implementation.

    return NextResponse.json({ error: 'Manual booking creation not fully implemented with DB yet' }, { status: 501 });
}
