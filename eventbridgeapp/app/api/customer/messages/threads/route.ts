// app/api/customer/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, messages } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Fetch threads for the authenticated customer
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    
    if (!authUser || authUser.accountType !== 'CUSTOMER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Customer access required' },
        { status: 401 }
      );
    }

    console.log('GET /api/customer/messages/threads - customerId:', authUser.id);
    
    // Get threads for this authenticated customer
    const threads = await db
      .select({
        id: messageThreads.id,
        vendorId: messageThreads.vendorId,
        customerId: messageThreads.customerId,
        lastMessage: messageThreads.lastMessage,
        lastMessageTime: messageThreads.lastMessageTime,
        unreadCount: messageThreads.customerUnreadCount,
      })
      .from(messageThreads)
      .innerJoin(users, eq(messageThreads.vendorId, users.id))
      .leftJoin(vendorProfiles, eq(messageThreads.vendorId, vendorProfiles.userId))
      .where(eq(messageThreads.customerId, authUser.id))
      .orderBy(desc(messageThreads.lastMessageTime))
      .limit(50);

    // Format response
    const formattedThreads = threads.map((thread: any) => ({
      id: thread.id,
      vendorId: thread.vendorId,
      customerId: thread.customerId,
      vendorName: thread.vendor?.businessName || 'Vendor',
      vendorAvatar: thread.vendor?.profileImage,
      lastMessage: thread.lastMessage || 'Start a conversation...',
      lastMessageTime: thread.lastMessageTime,
      unreadCount: thread.unreadCount || 0,
      online: Math.random() > 0.5, // Random online status for demo
    }));

    return NextResponse.json({
      success: true,
      threads: formattedThreads,
      count: formattedThreads.length,
    });

  } catch (error: any) {
    console.error('Error in messages API:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST - Create a new thread or add message to existing thread
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    
    if (!authUser || authUser.accountType !== 'CUSTOMER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Customer access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { vendorId, content } = body;

    console.log('POST /api/customer/messages/threads - vendorId:', vendorId, 'customerId:', authUser.id);

    if (!vendorId) {
      return NextResponse.json(
        { success: false, error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const [vendor] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, vendorId), eq(users.accountType, 'VENDOR')))
      .limit(1);

    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if a thread already exists for this customer-vendor pair
    const existingThread = await db
      .select({ id: messageThreads.id })
      .from(messageThreads)
      .where(
        and(
          eq(messageThreads.customerId, authUser.id),
          eq(messageThreads.vendorId, vendorId)
        )
      )
      .limit(1);

    let threadId: number;

    if (existingThread.length > 0) {
      // Thread exists, use it
      threadId = existingThread[0].id;
      console.log('Using existing thread:', threadId);
    } else {
      // Create a new thread
      const [newThread] = await db
        .insert(messageThreads)
        .values({
          customerId: authUser.id,
          vendorId: vendorId,
          lastMessage: content.substring(0, 200),
          lastMessageTime: new Date(),
          customerUnreadCount: 0,
          vendorUnreadCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      threadId = newThread.id;
      console.log('Created new thread:', threadId);
    }

    // Create the message
    const [newMessage] = await db
      .insert(messages)
      .values({
        threadId: threadId,
        senderId: authUser.id,
        senderType: 'CUSTOMER',
        content: content,
        read: false,
        createdAt: new Date(),
      })
      .returning();

    // Update the thread's last message and increment vendor's unread count
    await db
      .update(messageThreads)
      .set({
        lastMessage: content.substring(0, 200),
        lastMessageTime: new Date(),
        vendorUnreadCount: 1, // Reset to 1 for demo
        updatedAt: new Date(),
      })
      .where(eq(messageThreads.id, threadId));

    return NextResponse.json({
      success: true,
      message: 'Inquiry sent successfully',
      threadId: threadId,
      messageId: newMessage.id,
      timestamp: new Date().toISOString(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating thread/message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send inquiry' },
      { status: 500 }
    );
  }
}
