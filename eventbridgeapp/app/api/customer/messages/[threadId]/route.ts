import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(
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

        // Fetch messages
        const messageList = await db
            .select({
                id: messages.id,
                threadId: messages.threadId,
                senderId: messages.senderId,
                senderType: messages.senderType,
                content: messages.content,
                attachments: messages.attachments,
                timestamp: messages.createdAt,
                read: messages.read,
            })
            .from(messages)
            .where(eq(messages.threadId, threadId))
            .orderBy(messages.createdAt)
            .limit(100); // Limit to last 100 messages

        return NextResponse.json({
            success: true,
            messages: messageList,
            count: messageList.length
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch messages',
                details: error.message
            },
            { status: 500 }
        );
    }
}

async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
    try {
        const token = req.cookies.get('auth-token')?.value;
        return token ? 1 : null; // Replace with actual JWT verification
    } catch (error) {
        return null;
    }
}