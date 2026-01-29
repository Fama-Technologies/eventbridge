import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const threadId = parseInt(params.threadId);

        // Verify user has access to this thread
        const thread = await db
            .select()
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    eq(messageThreads.customerId, userId)
                )
            )
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread not found or access denied' },
                { status: 404 }
            );
        }

        // Mark all unread messages from vendor as read
        await db
            .update(messages)
            .set({ read: true })
            .where(
                and(
                    eq(messages.threadId, threadId),
                    eq(messages.senderType, 'VENDOR'),
                    eq(messages.read, false)
                )
            );

        // Update thread's unread count
        await db
            .update(messageThreads)
            .set({ 
                customerUnreadCount: 0,
                updatedAt: new Date()
            })
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
                details: error.message
            },
            { status: 500 }
        );
    }
}

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
    try {
        const token = req.cookies.get('auth-token')?.value;
        return token ? 1 : null;
    } catch (error) {
        return null;
    }
}