// app/api/customer/dashboard/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, bookings, events } from '@/drizzle/schema';
import { eq, and, gte, lt, desc, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function getCurrentUser() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session')?.value;

  if (authToken) {
    try {
      const payload = await verifyToken(authToken);
      if (payload && payload.userId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId as number))
          .limit(1);
        return user;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  }

  if (sessionToken) {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (session && new Date(session.expiresAt) >= new Date()) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);
      return user;
    }
  }

  return null;
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.accountType !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized - Customer only' }, { status: 403 });
    }

    // Calculate statistics
    const stats = await calculateCustomerStats(user.id);
    
    // Get recent bookings (last 30 days, limited to 5)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookingsData = await db
      .select({
        bookingId: bookings.id,
        bookingStatus: bookings.status,
        bookingAmount: bookings.totalAmount,
        bookingCreatedAt: bookings.createdAt,
        eventTitle: events.title,
        eventStartDate: events.startDate,
        eventId: events.id,
      })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .where(
        and(
          eq(bookings.clientId, user.id),
          gte(bookings.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    // Get upcoming events
    const upcomingEventsData = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.vendorId, user.id),
          gte(events.startDate, new Date())
        )
      )
      .orderBy(events.startDate)
      .limit(5);

    // Get recent activity
    const recentActivity = await getRecentActivity(user.id);

    // Get action required items (pending bookings)
    const actionItems = await getActionItems(user.id);

    return NextResponse.json({
      customer: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
      },
      stats,
      recentBookings: recentBookingsData.map((booking: { bookingId: any; eventTitle: any; eventStartDate: any; bookingStatus: any; bookingAmount: any; bookingCreatedAt: any; eventId: any; }) => ({
        id: booking.bookingId,
        eventName: booking.eventTitle || 'Untitled Event',
        eventDate: booking.eventStartDate,
        status: booking.bookingStatus || 'pending',
        amount: booking.bookingAmount || 0,
        createdAt: booking.bookingCreatedAt,
        eventId: booking.eventId,
      })),
      upcomingEvents: upcomingEventsData.map((event: { id: any; title: any; startDate: any; endDate: any; location: any; description: any; imageUrl: any; }) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        description: event.description,
        imageUrl: event.imageUrl,
      })),
      recentActivity,
      actionItems,
    });
  } catch (error) {
    console.error('Customer dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function calculateCustomerStats(userId: number) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  // Total events created
  const [totalEventsResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(events)
    .where(eq(events.vendorId, userId));

  // Upcoming events
  const [upcomingEventsResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(events)
    .where(
      and(
        eq(events.vendorId, userId),
        gte(events.startDate, now)
      )
    );

  // Total bookings
  const [totalBookingsResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(bookings)
    .where(eq(bookings.clientId, userId));

  // Pending bookings
  const [pendingBookingsResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.clientId, userId),
        eq(bookings.status, 'pending')
      )
    );

  // Total spent
  const [totalSpentResult] = await db
    .select({ total: sql<number>`cast(sum(total_amount) as integer)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.clientId, userId),
        eq(bookings.status, 'confirmed')
      )
    );

  return {
    totalEvents: Number(totalEventsResult?.count || 0),
    upcomingEvents: Number(upcomingEventsResult?.count || 0),
    totalBookings: Number(totalBookingsResult?.count || 0),
    pendingBookings: Number(pendingBookingsResult?.count || 0),
    totalSpent: Number(totalSpentResult?.total || 0),
  };
}

async function getRecentActivity(userId: number) {
  const activities = await db
    .select({
      bookingId: bookings.id,
      bookingStatus: bookings.status,
      bookingCreatedAt: bookings.createdAt,
      eventTitle: events.title,
    })
    .from(bookings)
    .leftJoin(events, eq(bookings.eventId, events.id))
    .where(eq(bookings.clientId, userId))
    .orderBy(desc(bookings.createdAt))
    .limit(10);

  return activities.map((activity: { eventTitle: string; bookingStatus: string; bookingId: { toString: () => any; }; bookingCreatedAt: any; }) => {
    const eventTitle = activity.eventTitle || 'an event';
    
    let type = 'status_update';
    let message = `Booking status updated for ${eventTitle}`;
    
    if (activity.bookingStatus === 'pending') {
      type = 'booking_created';
      message = `Created booking request for ${eventTitle}`;
    } else if (activity.bookingStatus === 'confirmed') {
      type = 'booking_confirmed';
      message = `Booking confirmed for ${eventTitle}`;
    } else if (activity.bookingStatus === 'cancelled') {
      type = 'booking_cancelled';
      message = `Booking cancelled for ${eventTitle}`;
    } else if (activity.bookingStatus === 'completed') {
      type = 'booking_completed';
      message = `Event ${eventTitle} completed`;
    }

    return {
      id: activity.bookingId.toString(),
      type,
      message,
      timestamp: activity.bookingCreatedAt,
    };
  });
}

async function getActionItems(userId: number) {
  // Get pending bookings that need action
  const pendingBookings = await db
    .select({
      bookingId: bookings.id,
      eventTitle: events.title,
      eventStartDate: events.startDate,
      bookingCreatedAt: bookings.createdAt,
    })
    .from(bookings)
    .leftJoin(events, eq(bookings.eventId, events.id))
    .where(
      and(
        eq(bookings.clientId, userId),
        eq(bookings.status, 'pending')
      )
    )
    .orderBy(desc(bookings.createdAt))
    .limit(5);

  // Get upcoming events without bookings
  const upcomingEventsWithoutBookings = await db
    .select({
      eventId: events.id,
      eventTitle: events.title,
      eventStartDate: events.startDate,
    })
    .from(events)
    .leftJoin(bookings, eq(events.id, bookings.eventId))
    .where(
      and(
        eq(events.vendorId, userId),
        gte(events.startDate, new Date()),
        sql`${bookings.id} IS NULL`
      )
    )
    .limit(3);

  return {
    pendingBookings: pendingBookings.map((b: { bookingId: any; eventTitle: any; eventStartDate: any; bookingCreatedAt: any; }) => ({
      id: b.bookingId,
      eventTitle: b.eventTitle || 'Untitled Event',
      eventDate: b.eventStartDate,
      createdAt: b.bookingCreatedAt,
      action: 'Review booking request',
    })),
    eventsNeedingVendors: upcomingEventsWithoutBookings.map((e: { eventId: any; eventTitle: any; eventStartDate: any; }) => ({
      id: e.eventId,
      eventTitle: e.eventTitle,
      eventDate: e.eventStartDate,
      action: 'Find vendors for this event',
    })),
  };
}