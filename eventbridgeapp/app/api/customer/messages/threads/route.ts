// app/api/customer/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, messages } from '@/drizzle/schema';
import { eq, desc, and } from 'drizzle-orm';
import { getToken } from 'next-auth/jwt';
import { verifyToken } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

// Debug helper to check session
async function debugSession(req: NextRequest) {
  // First try NextAuth token
  const nextAuthToken = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  console.log('=== SESSION DEBUG ===');
  console.log('NextAuth Token exists:', !!nextAuthToken);
  if (nextAuthToken) {
    console.log('NextAuth Token userId:', nextAuthToken.userId);
    console.log('NextAuth Token email:', nextAuthToken.email);
    console.log('NextAuth Token name:', nextAuthToken.name);
    console.log('NextAuth Token accountType:', nextAuthToken.accountType);
  }

  // Also check for custom auth-token cookie
  const authToken = req.cookies.get('auth-token')?.value;
  console.log('Custom auth-token exists:', !!authToken);
  if (authToken) {
    const customPayload = await verifyToken(authToken);
    if (customPayload) {
      console.log('Custom Token userId:', customPayload.userId);
      console.log('Custom Token email:', customPayload.email);
      console.log('Custom Token accountType:', customPayload.accountType);
    }
  }
  console.log('===================');

  // Return the most complete token available
  if (nextAuthToken && nextAuthToken.userId && nextAuthToken.email) {
    return {
      userId: Number(nextAuthToken.userId),
      email: nextAuthToken.email,
      name: nextAuthToken.name || 'User',
      accountType: nextAuthToken.accountType || 'CUSTOMER',
      source: 'nextauth'
    };
  }

  if (authToken) {
    const customPayload = await verifyToken(authToken);
    if (customPayload && customPayload.userId && customPayload.email) {
      return {
        userId: customPayload.userId,
        email: customPayload.email,
        name: `${customPayload.firstName || ''} ${customPayload.lastName || ''}`.trim() || 'User',
        accountType: customPayload.accountType || 'CUSTOMER',
        source: 'custom'
      };
    }
  }

  return null;
}

// GET - Fetch threads for the authenticated customer
export async function GET(req: NextRequest) {
  try {
    const session = await debugSession(req);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    console.log('GET /api/customer/messages/threads - customerId:', session.userId, 'source:', session.source);
    
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
      .where(eq(messageThreads.customerId, session.userId))
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
    const session = await debugSession(req);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { vendorId, content } = body;

    console.log('POST /api/customer/messages/threads - vendorId:', vendorId, 'customerId:', session.userId, 'source:', session.source);

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
          eq(messageThreads.customerId, session.userId),
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
          customerId: session.userId,
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
        senderId: session.userId,
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
