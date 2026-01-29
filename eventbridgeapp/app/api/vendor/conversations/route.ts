import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageThreads, users, bookings, messages, events, vendorProfiles } from '@/drizzle/schema';
import { eq, desc, and, ne } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.accountType !== 'VENDOR') {
            return NextResponse.json(
                { message: 'Access denied. Vendor account required.' },
                { status: 403 }
            );
        }

        // Fetch threads for this vendor
        // We'll join with users to get customer details
        // And bookings/events if available
        const threads = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                customerName: users.firstName,
                customerLastName: users.lastName,
                customerImage: users.image,
                lastMessage: messageThreads.lastMessage,
                lastMessageTime: messageThreads.lastMessageTime,
                unreadCount: messageThreads.vendorUnreadCount,
                bookingId: messageThreads.bookingId,
                eventName: events.title,
                eventDate: events.startDate,
                eventType: events.description, // Using description as type for now or join categories
                bookingStatus: bookings.status,
            })
            .from(messageThreads)
            .innerJoin(users, eq(messageThreads.customerId, users.id))
            .leftJoin(bookings, eq(messageThreads.bookingId, bookings.id))
            .leftJoin(events, eq(bookings.eventId, events.id))
            .where(
                and(
                    eq(messageThreads.vendorId, user.id),
                    eq(messageThreads.isArchived, false)
                )
            )
            .orderBy(desc(messageThreads.lastMessageTime));

        // Format the response to match the frontend expectations
        const formattedConversations = threads.map((thread: { customerName: any; customerLastName: any; id: any; customerImage: any; bookingId: any; eventName: any; eventType: any; lastMessage: any; lastMessageTime: string | number | Date; bookingStatus: any; unreadCount: any; eventDate: string | number | Date; }) => {
            const customerName = `${thread.customerName} ${thread.customerLastName}`.trim();

            return {
                id: String(thread.id),
                name: customerName,
                avatar: thread.customerImage || '',
                eventId: thread.bookingId ? String(thread.bookingId) : undefined,
                eventName: thread.eventName || 'General Inquiry',
                eventType: thread.eventType || 'Unspecified',
                lastMessage: thread.lastMessage || '',
                timestamp: thread.lastMessageTime ? new Date(thread.lastMessageTime).toLocaleDateString() : '',
                status: thread.bookingStatus || 'pending-quote',
                isVerified: true, // Assuming customers are verified for now
                unreadCount: thread.unreadCount || 0,
                unread: (thread.unreadCount || 0) > 0,
                // These details might need to be fetched dynamically or added to schema
                eventDetails: {
                    date: thread.eventDate ? new Date(thread.eventDate).toDateString() : 'TBD',
                    time: thread.eventDate ? new Date(thread.eventDate).toLocaleTimeString() : 'TBD',
                    venue: 'TBD', // Placeholder as it's not in the main query
                    guests: 0 // Placeholder
                },
                sharedFiles: [], // Would need a separate query for files
                messages: [] // detailed messages are fetched separately usually, but list view mocks them? 
                // The original mock had "messages" array in list view. 
                // We will leave it empty here or fetch last message only.
            };
        });

        return NextResponse.json({ conversations: formattedConversations });

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
