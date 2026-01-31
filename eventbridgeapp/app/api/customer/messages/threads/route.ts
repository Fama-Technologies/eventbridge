// app/api/customer/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, messages } from '@/drizzle/schema';
import { eq, desc, and, or } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

// Debug helper to check session
async function debugSession(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log('=== SESSION DEBUG ===');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token userId:', token.userId);
    console.log('Token email:', token.email);
    console.log('Token name:', token.name);
    console.log('Token accountType:', token.accountType);
    console.log('All token keys:', Object.keys(token));
  }
  console.log('===================');
  return token;
}

// GET - Fetch threads for the authenticated customer
export async function GET(req: NextRequest) {
  try {
    // Debug session first
    await debugSession(req);
    
    const authUser = await getAuthUser(req);
    console.log('Auth user result:', authUser);
    
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in. Token may be missing or expired.' },
        { status: 401 }
      );
    }

    if (authUser.accountType !== 'CUSTOMER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Customer access required' },
        { status: 403 }
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
      online: Math.random() > 0.5,
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
    // Debug session first
    await debugSession(req);
    
    const authUser = await getAuthUser(req);
    console.log('Auth user result:', authUser);
    
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in. Token may be missing or expired.' },
        { status: 401 }
      );
    }

    if (authUser.accountType !== 'CUSTOMER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Customer access required' },
        { status: 403 }
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
    const [vendorUser] = await db
      .select({ 
        id: users.id,
        accountType: users.accountType 
      })
      .from(users)
      .where(eq(users.id, vendorId))
      .limit(1);

    if (!vendorUser) {
      console.log('Vendor not found for id:', vendorId);
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Check if a thread already exists
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
      threadId = existingThread[0].id;
      console.log('Using existing thread:', threadId);
    } else {
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

    // Update thread
    await db
      .update(messageThreads)
      .set({
        lastMessage: content.substring(0, 200),
        lastMessageTime: new Date(),
        vendorUnreadCount: 1,
        updatedAt: new Date(),
      })
      .where(eq(messageThreads.id, threadId));

    return NextResponse.json({
      success: true,
      message: 'Chat started successfully',
      threadId: threadId,
      messageId: newMessage.id,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating thread/message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start chat: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
