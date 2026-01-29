import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads, users } from '@/drizzle/schema';
import { eq, and, desc, asc, lt, gt, inArray, ne } from 'drizzle-orm'; // Added 'ne'
import { getAuthUser } from '@/lib/auth';
import { sql } from 'drizzle-orm';

export async function GET(
    req: NextRequest,
    { params }: { params: { threadId: string } }
) {
    try {
        // Authenticate user using existing auth helper
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

        // Verify user has access to this thread
        const thread = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                vendorId: messageThreads.vendorId,
                lastMessageTime: messageThreads.lastMessageTime,
                customerUnreadCount: messageThreads.customerUnreadCount,
                vendorUnreadCount: messageThreads.vendorUnreadCount
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    userType === 'customer' 
                        ? eq(messageThreads.customerId, userId)
                        : eq(messageThreads.vendorId, userId)
                )
            )
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread not found or access denied' },
                { status: 404 }
            );
        }

        const threadData = thread[0];

        // Parse query parameters for pagination
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const before = url.searchParams.get('before'); // timestamp for pagination
        const sort = url.searchParams.get('sort') || 'desc'; // asc or desc

        // Build query conditions
        let conditions = [eq(messages.threadId, threadId)];
        
        if (before) {
            const beforeDate = new Date(before);
            if (!isNaN(beforeDate.getTime())) {
                if (sort === 'desc') {
                    // Use lt (less than) for descending order (older messages)
                    conditions.push(lt(messages.createdAt, beforeDate));
                } else {
                    // Use gt (greater than) for ascending order (newer messages)
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
            .limit(Math.min(limit, 200)) // Max 200 messages per request
            .offset(offset);

        // Mark messages as read if user is viewing them
        if (messageList.length > 0) {
            await markMessagesAsRead(threadId, userId, userType);
        }

        // Get total message count for this thread
        const [totalCountResult] = await db
            .select({ count: db.fn.count(messages.id).mapWith(Number) })
            .from(messages)
            .where(eq(messages.threadId, threadId));

        // Get unread count for the current user
        const unreadCount = userType === 'customer' 
            ? threadData.customerUnreadCount 
            : threadData.vendorUnreadCount;

        // Format messages with better structure
        const formattedMessages = messageList.map((msg: { id: any; threadId: any; sender: { id: any; firstName: any; lastName: any; image: any; }; senderId: number; senderType: any; content: any; attachments: any; timestamp: any; read: any; }) => ({
            id: msg.id,
            threadId: msg.threadId,
            sender: {
                id: msg.sender?.id || msg.senderId,
                name: msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown User',
                avatar: msg.sender?.image,
                type: msg.senderType
            },
            content: msg.content,
            attachments: msg.attachments || [],
            timestamp: msg.timestamp,
            read: msg.read,
            isOwn: msg.senderId === userId,
            status: determineMessageStatus(msg, userId)
        }));

        // Group messages by date for easier frontend display
        const messagesByDate = groupMessagesByDate(formattedMessages);

        return NextResponse.json({
            success: true,
            messages: formattedMessages,
            messagesByDate,
            pagination: {
                total: totalCountResult?.count || 0,
                limit,
                offset,
                hasMore: totalCountResult?.count > offset + messageList.length
            },
            thread: {
                id: threadId,
                lastMessageTime: threadData.lastMessageTime,
                unreadCount,
                participants: {
                    customerId: threadData.customerId,
                    vendorId: threadData.vendorId
                }
            }
        });

    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch messages',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// POST endpoint to send a message
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

        const { content, attachments } = await req.json();
        
        if (!content?.trim() && (!attachments || attachments.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'Message content or attachments required' },
                { status: 400 }
            );
        }

        // Verify user has access to this thread
        const thread = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                vendorId: messageThreads.vendorId
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    userType === 'customer' 
                        ? eq(messageThreads.customerId, userId)
                        : eq(messageThreads.vendorId, userId)
                )
            )
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread not found or access denied' },
                { status: 404 }
            );
        }

        // Create message
        const [message] = await db
            .insert(messages)
            .values({
                threadId,
                senderId: userId,
                senderType: userType.toUpperCase(),
                content: content?.trim() || null,
                attachments: attachments || [],
                read: false,
                createdAt: new Date()
            })
            .returning();

        // Update thread's last message
        await db
            .update(messageThreads)
            .set({
                lastMessage: content?.substring(0, 200) || '[Attachment]',
                lastMessageTime: new Date(),
                // Increment unread count for the other party using SQL expression
                [userType === 'customer' ? 'vendorUnreadCount' : 'customerUnreadCount']: 
                    sql`${messageThreads[userType === 'customer' ? 'vendorUnreadCount' : 'customerUnreadCount']} + 1`
            })
            .where(eq(messageThreads.id, threadId));

        // Get sender info for response
        const [senderInfo] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                image: users.image
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const formattedMessage = {
            id: message.id,
            threadId: message.threadId,
            sender: {
                id: senderInfo?.id || userId,
                name: senderInfo ? `${senderInfo.firstName} ${senderInfo.lastName}` : 'You',
                avatar: senderInfo?.image,
                type: userType.toUpperCase()
            },
            content: message.content,
            attachments: message.attachments || [],
            timestamp: message.createdAt,
            read: message.read,
            isOwn: true,
            status: 'sent'
        };

        return NextResponse.json({
            success: true,
            message: formattedMessage,
            notification: `Message sent to ${userType === 'customer' ? 'vendor' : 'customer'}`
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send message',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

// PATCH endpoint to mark messages as read
export async function PATCH(
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

        await markMessagesAsRead(threadId, userId, userType, messageIds);

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

// Helper function to mark messages as read
async function markMessagesAsRead(
    threadId: number, 
    userId: number, 
    userType: 'customer' | 'vendor',
    specificMessageIds?: number[]
) {
    // Update messages as read
    if (specificMessageIds && specificMessageIds.length > 0) {
        // Update specific messages by ID
        await db
            .update(messages)
            .set({ read: true })
            .where(
                and(
                    eq(messages.threadId, threadId),
                    ne(messages.senderId, userId), // Use ne() for "not equal"
                    eq(messages.read, false),
                    inArray(messages.id, specificMessageIds)
                )
            );
    } else {
        // Update all unread messages from other party
        await db
            .update(messages)
            .set({ read: true })
            .where(
                and(
                    eq(messages.threadId, threadId),
                    ne(messages.senderId, userId), // Use ne() for "not equal"
                    eq(messages.read, false)
                )
            );
    }

    // Reset unread count for this user in the thread
    const fieldToReset = userType === 'customer' ? 'customerUnreadCount' : 'vendorUnreadCount';
    await db
        .update(messageThreads)
        .set({ [fieldToReset]: 0 })
        .where(eq(messageThreads.id, threadId));
}

// Helper function to group messages by date
function groupMessagesByDate(messages: any[]) {
    const groups: Record<string, any[]> = {};
    
    messages.forEach(message => {
        const date = new Date(message.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (!groups[date]) {
            groups[date] = [];
        }
        
        groups[date].push(message);
    });
    
    return groups;
}

// Helper function to determine message status
function determineMessageStatus(message: any, currentUserId: number): string {
    if (message.senderId === currentUserId) {
        if (message.read) return 'read';
        return 'sent';
    }
    return 'received';
}