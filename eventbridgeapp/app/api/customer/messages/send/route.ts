import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
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
        const userType = authUser.accountType;
        
        const { threadId, content, attachments, quoteId } = await req.json();

        if (!threadId) {
            return NextResponse.json(
                { success: false, error: 'Thread ID is required' },
                { status: 400 }
            );
        }

        if (!content?.trim() && (!attachments || attachments.length === 0)) {
            return NextResponse.json(
                { success: false, error: 'Message content or attachments are required' },
                { status: 400 }
            );
        }

        // Verify user has access to this thread
        const thread = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                vendorId: messageThreads.vendorId,
                vendorUnreadCount: messageThreads.vendorUnreadCount,
                customerUnreadCount: messageThreads.customerUnreadCount
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    userType === 'CUSTOMER' 
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
        
        // Insert message
        const [newMessage] = await db
            .insert(messages)
            .values({
                threadId,
                senderId: userId,
                senderType: userType,
                content: content?.trim() || null,
                attachments: attachments || [],
                read: false, // Messages start unread
                createdAt: new Date(),
            })
            .returning();

        // Update thread - increment unread count for the other party
        const otherPartyField = userType === 'CUSTOMER' ? 'vendorUnreadCount' : 'customerUnreadCount';
        const currentUnreadCount = threadData[otherPartyField] || 0;
        
        await db
            .update(messageThreads)
            .set({
                lastMessage: content?.substring(0, 200) || '[Attachment]',
                lastMessageTime: new Date(),
                [otherPartyField]: currentUnreadCount + 1,
                updatedAt: new Date()
            })
            .where(eq(messageThreads.id, threadId));

        // If this is a quote acceptance, you could handle it here
        if (quoteId) {
            // You would typically update a quotes table
            // await updateQuoteStatus(quoteId, 'accepted');
            console.log(`Quote ${quoteId} mentioned in message`);
        }

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                threadId: newMessage.threadId,
                senderId: newMessage.senderId,
                senderType: newMessage.senderType,
                content: newMessage.content,
                attachments: newMessage.attachments || [],
                timestamp: newMessage.createdAt,
                read: newMessage.read,
            },
            threadUpdated: true,
            unreadCounts: {
                customer: userType === 'VENDOR' ? currentUnreadCount + 1 : 0,
                vendor: userType === 'CUSTOMER' ? currentUnreadCount + 1 : 0
            }
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