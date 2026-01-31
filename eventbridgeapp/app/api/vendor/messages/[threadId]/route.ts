import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messages, messageThreads, users } from '@/drizzle/schema';
import { eq, and, asc, desc, lt, gt } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Type for message data
interface MessageData {
    id: number;
    threadId: number;
    senderId: number;
    senderType: string | null;
    content: string | null;
    attachments: unknown;
    timestamp: Date | null;
    read: boolean | null;
    sender: {
        id: number;
        firstName: string | null;
        lastName: string | null;
        image: string | null;
    } | null;
}

export async function GET(
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
                customerId: messageThreads.customerId,
                lastMessageTime: messageThreads.lastMessageTime,
                vendorUnreadCount: messageThreads.vendorUnreadCount,
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

        const threadData = thread[0];

        // Parse query parameters
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const before = url.searchParams.get('before');
        const sort = url.searchParams.get('sort') || 'asc';

        // Build query conditions
        let conditions = [eq(messages.threadId, threadId)];
        
        if (before) {
            const beforeDate = new Date(before);
            if (!isNaN(beforeDate.getTime())) {
                if (sort === 'desc') {
                    conditions.push(lt(messages.createdAt, beforeDate));
                } else {
                    conditions.push(gt(messages.createdAt, beforeDate));
                }
            }
        }

        // Fetch messages with sender info
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
                sender: {
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    image: users.image
                }
            })
            .from(messages)
            .leftJoin(users, eq(messages.senderId, users.id))
            .where(and(...conditions))
            .orderBy(sort === 'desc' ? desc(messages.createdAt) : asc(messages.createdAt))
            .limit(Math.min(limit, 200))
            .offset(offset);

        // Mark messages as read
        if (messageList.length > 0) {
            await db
                .update(messages)
                .set({ read: true })
                .where(
                    and(
                        eq(messages.threadId, threadId),
                        eq(messages.read, false),
                        sql`${messages.senderId} != ${user.id}`
                    )
                );

            // Reset unread count
            await db
                .update(messageThreads)
                .set({ vendorUnreadCount: 0 })
                .where(eq(messageThreads.id, threadId));
        }

        // Get total count
        const totalCountResult = await db
            .select({ count: sql`count(${messages.id})`.mapWith(Number) })
            .from(messages)
            .where(eq(messages.threadId, threadId));

        const totalCount = totalCountResult[0]?.count || 0;

        // Format messages
        const formattedMessages = messageList.map((msg: MessageData) => ({
            id: msg.id,
            threadId: msg.threadId,
            sender: {
                id: msg.sender?.id || msg.senderId,
                name: msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'Unknown',
                avatar: msg.sender?.image,
                type: msg.senderType
            },
            senderType: msg.senderType,
            content: msg.content,
            attachments: msg.attachments || [],
            timestamp: msg.timestamp,
            read: msg.read,
            isOwn: msg.senderId === user.id
        }));

        return NextResponse.json({
            success: true,
            messages: formattedMessages,
            pagination: {
                total: totalCount,
                limit,
                offset,
                hasMore: totalCount > offset + messageList.length
            },
            thread: {
                id: threadId,
                lastMessageTime: threadData.lastMessageTime,
                unreadCount: 0, // We just marked them as read
                participants: {
                    customerId: threadData.customerId,
                    vendorId: threadData.vendorId
                }
            }
        });

    } catch (error) {
        console.error('Error fetching vendor messages:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

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

        const { content, attachments } = await req.json();

        if (!content?.trim() && (!attachments || attachments.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'Message content or attachments required' },
                { status: 400 }
            );
        }

        // Verify thread belongs to this vendor
        const thread = await db
            .select({
                id: messageThreads.id,
                vendorId: messageThreads.vendorId,
                customerId: messageThreads.customerId,
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

        // Create message
        const [newMessage] = await db
            .insert(messages)
            .values({
                threadId,
                senderId: user.id,
                senderType: 'VENDOR',
                content: content?.trim() || null,
                attachments: attachments || [],
                read: false,
                createdAt: new Date()
            })
            .returning();

        // Update thread
        await db
            .update(messageThreads)
            .set({
                lastMessage: content?.substring(0, 200) || '[Attachment]',
                lastMessageTime: new Date(),
                customerUnreadCount: sql`${messageThreads.customerUnreadCount} + 1`
            })
            .where(eq(messageThreads.id, threadId));

        // Get sender info
        const [senderInfo] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                image: users.image
            })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        const formattedMessage = {
            id: newMessage.id,
            threadId: newMessage.threadId,
            sender: {
                id: senderInfo?.id || user.id,
                name: senderInfo ? `${senderInfo.firstName || ''} ${senderInfo.lastName || ''}`.trim() : 'You',
                avatar: senderInfo?.image,
                type: 'VENDOR'
            },
            senderType: 'VENDOR',
            content: newMessage.content,
            attachments: newMessage.attachments || [],
            timestamp: newMessage.createdAt,
            read: newMessage.read,
            isOwn: true
        };

        return NextResponse.json({
            success: true,
            message: formattedMessage
        }, { status: 201 });

    } catch (error) {
        console.error('Error sending vendor message:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
