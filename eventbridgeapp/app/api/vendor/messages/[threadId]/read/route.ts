import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and, ne, inArray } from 'drizzle-orm';

export async function POST(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
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

        const threadId = parseInt(params.threadId);
        
        if (isNaN(threadId) || threadId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid thread ID' },
                { status: 400 }
            );
        }

        // Verify thread belongs to this vendor
        const thread = await db
            .select({
                id: messageThreads.id,
                vendorId: messageThreads.vendorId,
            })
            .from(messageThreads)
            .where(eq(messageThreads.id, threadId))
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread not found' },
                { status: 404 }
            );
        }

        if (thread[0].vendorId !== user.id) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // Parse request body for specific message IDs (optional)
        let messageIds: number[] = [];
        try {
            const body = await req.json();
            messageIds = body.messageIds || [];
        } catch {
            // No body or invalid JSON, mark all as read
        }

        // Mark messages as read
        if (messageIds.length > 0) {
            // Mark specific messages as read
            await db
                .update(messages)
                .set({ read: true })
                .where(
                    and(
                        eq(messages.threadId, threadId),
                        ne(messages.senderId, user.id), // Only mark messages from customer
                        eq(messages.read, false),
                        inArray(messages.id, messageIds)
                    )
                );
        } else {
            // Mark all unread messages from customer as read
            await db
                .update(messages)
                .set({ read: true })
                .where(
                    and(
                        eq(messages.threadId, threadId),
                        ne(messages.senderId, user.id),
                        eq(messages.read, false)
                    )
                );
        }

        // Reset vendor's unread count for this thread
        await db
            .update(messageThreads)
            .set({ vendorUnreadCount: 0 })
            .where(eq(messageThreads.id, threadId));

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
