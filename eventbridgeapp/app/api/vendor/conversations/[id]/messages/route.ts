import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, asc, sql } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const threadId = Number(params.id);
        if (isNaN(threadId)) {
            return NextResponse.json({ message: 'Invalid conversation ID' }, { status: 400 });
        }

        // Verify thread belongs to vendor
        const thread = await db.query.messageThreads.findFirst({
            where: eq(messageThreads.id, threadId),
        });

        if (!thread) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        if (thread.vendorId !== user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Fetch messages
        const threadMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.threadId, threadId))
            .orderBy(asc(messages.createdAt));

        // Format messages
        const formattedMessages = threadMessages.map((msg: any) => ({
            id: String(msg.id),
            conversationId: String(msg.threadId),
            content: msg.content || '',
            timestamp: msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: msg.senderType === 'VENDOR' ? 'vendor' : 'user',
            attachments: msg.attachments || [] // JSONB should be parsed automatically or casted
        }));

        // success, also mark as read for vendor
        // We do this asynchronously to not block response? Or await it.
        // It's better to await to ensure consistency.
        if (thread.vendorUnreadCount && thread.vendorUnreadCount > 0) {
            await db.update(messageThreads)
                .set({ vendorUnreadCount: 0 })
                .where(eq(messageThreads.id, threadId));
        }

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const threadId = Number(params.id);
        if (isNaN(threadId)) {
            return NextResponse.json({ message: 'Invalid conversation ID' }, { status: 400 });
        }

        // Handle FormData for attachments
        const formData = await req.formData();
        const content = formData.get('content') as string;
        // Attachments uploading logic would go here. 
        // For now we will support text and assume attachments are handled separately or mock them
        // If the 'attachments' field contains file URLs (after upload), we can use that.
        // But typically the frontend uploads first, then sends URLs.
        // Or sends files here. 
        // Based on lib/messages-data.ts, it appends 'attachments' as Files.
        // So we would need to upload them to S3/Blob storage.
        // I'll leave a TODO or simple placeholder for attachments to keep this focused on DB.

        if (!content) {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        // Verify thread owner
        const thread = await db.query.messageThreads.findFirst({
            where: eq(messageThreads.id, threadId),
        });

        if (!thread || thread.vendorId !== user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        // Insert message
        const [newMessage] = await db.insert(messages).values({
            threadId,
            senderId: user.id,
            senderType: 'VENDOR',
            content,
            attachments: [], // TODO: Handle file uploads
            read: false, // Customer hasn't read it
        }).returning();

        // Update thread
        await db.update(messageThreads)
            .set({
                lastMessage: content,
                lastMessageTime: new Date(),
                customerUnreadCount: sql`${messageThreads.customerUnreadCount} + 1`,
                vendorUnreadCount: 0 // We read it while replying
            })
            .where(eq(messageThreads.id, threadId));

        return NextResponse.json({
            message: {
                id: String(newMessage.id),
                content: newMessage.content,
                timestamp: newMessage.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'vendor',
                attachments: []
            }
        });

    } catch (error) {
        console.error('Failed to send message:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
