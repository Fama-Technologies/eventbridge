import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { threadId, content, quoteId } = await req.json();

        if (!threadId || !content) {
            return NextResponse.json(
                { success: false, error: 'Thread ID and content are required' },
                { status: 400 }
            );
        }

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

        // Insert message
        const [newMessage] = await db
            .insert(messages)
            .values({
                threadId,
                senderId: userId,
                senderType: 'CUSTOMER',
                content,
                read: true, // Customer sent it, so it's read by them
                createdAt: new Date(),
            })
            .returning();

        // Update thread
        await db
            .update(messageThreads)
            .set({
                lastMessage: content,
                lastMessageTime: new Date(),
                vendorUnreadCount: (thread[0].vendorUnreadCount || 0) + 1,
                updatedAt: new Date()
            })
            .where(eq(messageThreads.id, threadId));

        // If this is a quote acceptance, update the quote
        if (quoteId) {
            // You'll need to implement quote acceptance logic
            console.log(`Quote ${quoteId} accepted in thread ${threadId}`);
        }

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                threadId: newMessage.threadId,
                senderId: newMessage.senderId,
                senderType: newMessage.senderType,
                content: newMessage.content,
                attachments: newMessage.attachments,
                timestamp: newMessage.createdAt,
                read: newMessage.read,
            },
            threadUpdated: true
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send message',
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