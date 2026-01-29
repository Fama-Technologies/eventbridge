import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const authUser = await getAuthUser(req);
        
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = authUser.id;
        const userType = authUser.accountType === 'CUSTOMER' ? 'customer' : 'vendor';
        const threadId = parseInt(params.threadId);
        
        if (isNaN(threadId) || threadId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid thread ID' },
                { status: 400 }
            );
        }

        const { messageIds } = await req.json();

        // Update messages as read
        if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
            // Mark specific messages as read
            for (const messageId of messageIds) {
                await db
                    .update(messages)
                    .set({ read: true })
                    .where(
                        and(
                            eq(messages.id, messageId),
                            eq(messages.threadId, threadId),
                            ne(messages.senderId, userId)
                        )
                    );
            }
        } else {
            // Mark all unread messages as read
            await db
                .update(messages)
                .set({ read: true })
                .where(
                    and(
                        eq(messages.threadId, threadId),
                        ne(messages.senderId, userId),
                        eq(messages.read, false)
                    )
                );
        }

        // Reset unread count
        const fieldToReset = userType === 'customer' ? 'customerUnreadCount' : 'vendorUnreadCount';
        await db
            .update(messageThreads)
            .set({ [fieldToReset]: 0 })
            .where(eq(messageThreads.id, threadId));

        return NextResponse.json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error: any) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to mark messages as read',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}