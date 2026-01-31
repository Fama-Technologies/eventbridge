import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageThreads, users, bookings, events } from '@/drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Type for thread data from query
interface ThreadData {
    id: number;
    customerId: number;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerEmail: string | null;
    customerImage: string | null;
    lastMessage: string | null;
    lastMessageTime: Date | null;
    unreadCount: number | null;
    bookingId: number | null;
    eventName: string | null;
    eventDate: Date | null;
    bookingStatus: string | null;
    createdAt: Date | null;
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.accountType !== 'VENDOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Vendor account required.' },
                { status: 403 }
            );
        }

        // Parse query parameters
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const status = url.searchParams.get('status'); // 'unread', 'all'

        // Build query conditions
        let conditions = [
            eq(messageThreads.vendorId, user.id),
            eq(messageThreads.isArchived, false)
        ];

        // Fetch threads for this vendor with customer details
        const threads = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                customerFirstName: users.firstName,
                customerLastName: users.lastName,
                customerEmail: users.email,
                customerImage: users.image,
                lastMessage: messageThreads.lastMessage,
                lastMessageTime: messageThreads.lastMessageTime,
                unreadCount: messageThreads.vendorUnreadCount,
                bookingId: messageThreads.bookingId,
                eventName: events.title,
                eventDate: events.startDate,
                bookingStatus: bookings.status,
                createdAt: messageThreads.createdAt,
            })
            .from(messageThreads)
            .innerJoin(users, eq(messageThreads.customerId, users.id))
            .leftJoin(bookings, eq(messageThreads.bookingId, bookings.id))
            .leftJoin(events, eq(bookings.eventId, events.id))
            .where(and(...conditions))
            .orderBy(desc(messageThreads.lastMessageTime))
            .limit(Math.min(limit, 100))
            .offset(offset);

        // Get total count
        const totalCountResult = await db
            .select({ count: sql`count(${messageThreads.id})`.mapWith(Number) })
            .from(messageThreads)
            .where(and(...conditions));

        const totalCount = totalCountResult[0]?.count || 0;

        // Get total unread count across all threads
        const unreadCountResult = await db
            .select({ total: sql`COALESCE(SUM(${messageThreads.vendorUnreadCount}), 0)`.mapWith(Number) })
            .from(messageThreads)
            .where(and(
                eq(messageThreads.vendorId, user.id),
                eq(messageThreads.isArchived, false)
            ));

        const totalUnread = unreadCountResult[0]?.total || 0;

        // Format threads for response
        const formattedThreads = threads.map((thread: ThreadData) => {
            const customerName = `${thread.customerFirstName || ''} ${thread.customerLastName || ''}`.trim() || 'Customer';
            
            return {
                id: thread.id,
                customer: {
                    id: thread.customerId,
                    name: customerName,
                    email: thread.customerEmail,
                    avatar: thread.customerImage,
                },
                lastMessage: thread.lastMessage,
                lastMessageTime: thread.lastMessageTime,
                unreadCount: thread.unreadCount || 0,
                hasUnread: (thread.unreadCount || 0) > 0,
                booking: thread.bookingId ? {
                    id: thread.bookingId,
                    eventName: thread.eventName,
                    eventDate: thread.eventDate,
                    status: thread.bookingStatus,
                } : null,
                createdAt: thread.createdAt,
            };
        });

        return NextResponse.json({
            success: true,
            threads: formattedThreads,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: totalCount > offset + threads.length
            },
            summary: {
                totalThreads: totalCount,
                totalUnread: totalUnread
            }
        });

    } catch (error) {
        console.error('Failed to fetch vendor message threads:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
