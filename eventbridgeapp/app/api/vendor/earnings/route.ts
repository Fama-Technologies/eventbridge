import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, vendorProfiles, users, events } from '@/drizzle/schema';
import { eq, desc, sql, and, or } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await db.query.vendorProfiles.findFirst({
            where: eq(vendorProfiles.userId, user.id),
        });

        if (!vendor) {
            return NextResponse.json({
                stats: { totalBookingsValue: 0, thisMonthValue: 0, completedPaidCount: 0, pendingPaymentsCount: 0 },
                transactions: []
            });
        }

        // Stats aggregation
        const statsQuery = await db
            .select({
                totalValue: sql<number>`sum(${bookings.totalAmount})`,
                completedCount: sql<number>`count(*) filter (where ${bookings.status} = 'completed' or ${bookings.status} = 'confirmed')`,
                pendingCount: sql<number>`count(*) filter (where ${bookings.status} = 'pending')`,
            })
            .from(bookings)
            .where(eq(bookings.vendorId, vendor.id));

        const stats = statsQuery[0];

        // Transactions (Recent Bookings treated as transactions)
        const recentTrans = await db
            .select({
                id: bookings.id,
                eventName: events.title,
                clientName: users.firstName,
                clientLastName: users.lastName,
                date: bookings.bookingDate,
                amount: bookings.totalAmount,
                status: bookings.paymentStatus,
            })
            .from(bookings)
            .leftJoin(events, eq(bookings.eventId, events.id))
            .leftJoin(users, eq(bookings.clientId, users.id))
            .where(eq(bookings.vendorId, vendor.id))
            .orderBy(desc(bookings.bookingDate))
            .limit(10);

        const transactions = recentTrans.map((t: any) => ({
            id: t.id.toString(),
            title: t.eventName || "Event Service",
            clientName: `${t.clientName} ${t.clientLastName}`,
            clientInitials: `${t.clientName?.[0] || ''}${t.clientLastName?.[0] || ''}`,
            date: t.date ? new Date(t.date).toLocaleDateString() : '',
            amount: t.amount || 0,
            status: t.status || 'pending',
            paymentDate: t.status === 'paid' ? (t.date ? new Date(t.date).toLocaleDateString() : '') : undefined
        }));

        return NextResponse.json({
            stats: {
                totalBookingsValue: stats.totalValue || 0,
                thisMonthValue: 0, // Placeholder needs date math
                completedPaidCount: stats.completedCount || 0,
                pendingPaymentsCount: stats.pendingCount || 0
            },
            transactions
        });

    } catch (error) {
        console.error('Failed to fetch earnings:', error);
        return NextResponse.json({
            stats: { totalBookingsValue: 0, thisMonthValue: 0, completedPaidCount: 0, pendingPaymentsCount: 0 },
            transactions: []
        });
    }
}
