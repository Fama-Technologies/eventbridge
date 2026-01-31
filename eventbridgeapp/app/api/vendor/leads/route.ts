 import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageThreads, users, bookings, messages, events } from '@/drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

// Type for thread data returned from the query
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
    createdAt: Date | null;
}

// Type for message data
interface MessageData {
    threadId: number;
    content: string | null;
    createdAt: Date | null;
}

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

        // Fetch message threads for this vendor as leads
        // Each thread represents a potential lead/inquiry from a customer
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
                createdAt: messageThreads.createdAt,
            })
            .from(messageThreads)
            .innerJoin(users, eq(messageThreads.customerId, users.id))
            .leftJoin(bookings, eq(messageThreads.bookingId, bookings.id))
            .where(
                and(
                    eq(messageThreads.vendorId, user.id),
                    eq(messageThreads.isArchived, false)
                )
            )
            .orderBy(desc(messageThreads.lastMessageTime));

        // Get the first message for each thread to use as inquiry details
        const threadIds = threads.map((t: ThreadData) => t.id);
        
        let firstMessages: Record<number, MessageData> = {};
        if (threadIds.length > 0) {
            const messagesData = await db
                .select({
                    threadId: messages.threadId,
                    content: messages.content,
                    createdAt: messages.createdAt,
                })
                .from(messages)
                .where(sql`${messages.threadId} IN (${sql.join(threadIds.map((id: number) => sql`${id}`), sql`, `)})`)
                .orderBy(messages.createdAt);
            
            // Get first message per thread
            for (const msg of messagesData) {
                if (!firstMessages[msg.threadId]) {
                    firstMessages[msg.threadId] = msg;
                }
            }
        }

        // Format the response to match the Lead interface expected by the frontend
        const formattedLeads = threads.map((thread: ThreadData) => {
            const customerName = `${thread.customerFirstName || ''} ${thread.customerLastName || ''}`.trim() || 'Customer';
            const firstMessage = firstMessages[thread.id];
            const hasUnread = (thread.unreadCount || 0) > 0;
            
            // Determine status based on unread count and booking status
            let status: 'new' | 'responded' | 'quoted' | 'booked' | 'declined' = 'new';
            if (!hasUnread && thread.bookingId) {
                status = 'booked';
            } else if (!hasUnread) {
                status = 'responded';
            }

            return {
                id: String(thread.id),
                name: customerName,
                email: thread.customerEmail || '',
                avatar: thread.customerImage || '',
                eventType: 'General Inquiry', // Could be enhanced with event data
                eventDate: thread.createdAt ? new Date(thread.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : 'TBD',
                guests: 0, // Could be enhanced with booking data
                budget: 'Not specified',
                inquiryNote: firstMessage?.content || thread.lastMessage || 'No message content',
                status: status,
                inquiredAt: thread.createdAt ? new Date(thread.createdAt).toISOString() : new Date().toISOString(),
                conversationId: String(thread.id),
                messageCount: thread.unreadCount || 0,
            };
        });

        return NextResponse.json({ leads: formattedLeads });

    } catch (error) {
        console.error('Failed to fetch leads:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
