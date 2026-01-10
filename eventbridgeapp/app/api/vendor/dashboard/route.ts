import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, vendorProfiles, bookings, events } from '@/drizzle/schema';
import { eq, and, gte, lt, desc, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

// Mark this route as dynamic to prevent static generation
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

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized - Vendor only' }, { status: 403 });
    }

    // Get vendor profile
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ error: 'Vendor profile not found' }, { status: 404 });
    }

    // Calculate statistics
    const stats = await calculateVendorStats(vendorProfile.id);
    
    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(vendorProfile);

    // Get recent bookings (last 30 days, limited to 5)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentBookingsData = await db
      .select({
        booking: bookings,
        event: events,
        client: users,
      })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .innerJoin(users, eq(bookings.clientId, users.id))
      .where(
        and(
          eq(bookings.vendorId, vendorProfile.id),
          gte(bookings.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    // Get recent activity (last 10 bookings for activity feed)
    const recentActivityData = await db
      .select({
        booking: bookings,
        event: events,
        client: users,
      })
      .from(bookings)
      .innerJoin(events, eq(bookings.eventId, events.id))
      .innerJoin(users, eq(bookings.clientId, users.id))
      .where(eq(bookings.vendorId, vendorProfile.id))
      .orderBy(desc(bookings.createdAt))
      .limit(10);

    // Format recent bookings
    const recentBookings = recentBookingsData.map((item: { booking: { id: any; status: any; totalAmount: any; createdAt: any; }; event: { title: any; startDate: any; }; client: { firstName: any; lastName: any; }; }) => ({
      id: item.booking.id,
      eventName: item.event.title || 'Untitled Event',
      eventDate: item.event.startDate,
      status: item.booking.status || 'pending',
      amount: item.booking.totalAmount || 0,
      createdAt: item.booking.createdAt,
      clientName: `${item.client.firstName} ${item.client.lastName}`,
    }));

    // Generate activity feed from recent bookings
    const recentActivity = recentActivityData.flatMap((item: { client: { firstName: any; lastName: any; }; event: { title: string; }; booking: { id: any; createdAt: any; updatedAt: string | number | Date; status: string; }; }) => {
      const activities = [];
      const clientName = `${item.client.firstName} ${item.client.lastName}`;
      const eventName = item.event.title || 'an event';
      
      // Booking created activity
      activities.push({
        id: `booking_${item.booking.id}`,
        type: 'new_request' as const,
        message: `New booking request for "${eventName}" from ${clientName}`,
        timestamp: item.booking.createdAt,
      });

      // If booking was recently updated
      if (item.booking.updatedAt && 
          new Date(item.booking.updatedAt).getTime() > thirtyDaysAgo.getTime() &&
          item.booking.status === 'confirmed') {
        activities.push({
          id: `confirmed_${item.booking.id}`,
          type: 'booking_confirmed' as const,
          message: `Booking confirmed for "${eventName}"`,
          timestamp: item.booking.updatedAt,
        });
      }

      return activities;
    }).sort((a: { timestamp: string | number | Date; }, b: { timestamp: string | number | Date; }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Construct vendor info with fallbacks
    const businessName = vendorProfile.businessName || `${user.firstName} ${user.lastName}`;
    const location = vendorProfile.city && vendorProfile.state 
      ? `${vendorProfile.city}, ${vendorProfile.state}`
      : vendorProfile.address || vendorProfile.city || vendorProfile.state;

    return NextResponse.json({
      vendor: {
        id: vendorProfile.id,
        businessName,
        category: 'Event Vendor',
        email: user.email,
        phone: vendorProfile.phone,
        location,
        description: vendorProfile.description,
        verified: vendorProfile.isVerified || false,
        rating: vendorProfile.rating || 0,
        totalReviews: vendorProfile.reviewCount || 0,
        avatar: vendorProfile.profileImage || user.image || null,
        address: vendorProfile.address,
        city: vendorProfile.city,
        state: vendorProfile.state,
        profileImage: vendorProfile.profileImage,
        isVerified: vendorProfile.isVerified,
      },
      stats,
      profileCompletion,
      recentBookings,
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function calculateVendorStats(vendorId: number) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

  // Get current period bookings (last 30 days)
  const currentPeriodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.vendorId, vendorId),
        gte(bookings.createdAt, thirtyDaysAgo)
      )
    );

  const currentRevenue = currentPeriodBookings.reduce((sum: any, b: { totalAmount: any; }) => sum + (b.totalAmount || 0), 0);
  const currentBookings = currentPeriodBookings.length;

  // Get previous period bookings (30-60 days ago)
  const previousPeriodBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.vendorId, vendorId),
        gte(bookings.createdAt, sixtyDaysAgo),
        lt(bookings.createdAt, thirtyDaysAgo)
      )
    );

  const previousRevenue = previousPeriodBookings.reduce((sum: any, b: { totalAmount: any; }) => sum + (b.totalAmount || 0), 0);
  const previousBookings = previousPeriodBookings.length;

  // Calculate pending requests (status = 'pending')
  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.vendorId, vendorId),
        eq(bookings.status, 'pending')
      )
    );

  const pendingCount = Number(pendingResult?.count) || 0;

  // Calculate active events (confirmed bookings with future dates)
  const [activeEventsResult] = await db
    .select({ count: sql<number>`count(distinct ${bookings.eventId})` })
    .from(bookings)
    .innerJoin(events, eq(bookings.eventId, events.id))
    .where(
      and(
        eq(bookings.vendorId, vendorId),
        eq(bookings.status, 'confirmed'),
        sql`${events.startDate} > NOW()`
      )
    );

  const activeEvents = Number(activeEventsResult?.count) || 0;

  // Calculate growth percentages
  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
  const bookingsGrowth = calculateGrowth(currentBookings, previousBookings);

  return {
    totalRevenue: currentRevenue,
    revenueGrowth,
    totalBookings: currentBookings,
    bookingsGrowth,
    pendingRequests: pendingCount,
    activeEvents,
  };
}

function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function calculateProfileCompletion(vendor: any): number {
  const fields = [
    vendor.businessName,
    vendor.description,
    vendor.phone,
    vendor.address,
    vendor.city,
    vendor.state,
    vendor.profileImage,
  ];
  
  // Add extra weight for verification
  const totalFields = fields.length + 1; // +1 for verification
  const filledFields = fields.filter(field => 
    field && field.toString().trim() !== ''
  ).length + (vendor.isVerified ? 1 : 0);
  
  return Math.round((filledFields / totalFields) * 100);
}