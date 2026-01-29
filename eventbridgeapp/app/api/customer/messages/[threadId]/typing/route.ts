import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

// Store typing status in memory
const typingStatus = new Map<string, { isTyping: boolean; timestamp: Date; userId: number }>();

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

        const { isTyping } = await req.json();
        
        if (typeof isTyping !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'isTyping must be a boolean' },
                { status: 400 }
            );
        }

        // Verify user has access to thread
        const thread = await db
            .select({
                id: messageThreads.id
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

        // Store typing status
        const key = `thread-${threadId}-${userType}`;
        typingStatus.set(key, {
            isTyping,
            timestamp: new Date(),
            userId
        });

        // Clean up old entries
        cleanupTypingStatus();

        return NextResponse.json({
            success: true,
            message: isTyping ? 'Typing indicator sent' : 'Typing stopped'
        });

    } catch (error: any) {
        console.error('Error sending typing indicator:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send typing indicator',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function GET(
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

        // Verify user has access to thread
        const thread = await db
            .select({
                id: messageThreads.id
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

        // Check if other party is typing
        const otherUserType = userType === 'customer' ? 'vendor' : 'customer';
        const typingKey = `thread-${threadId}-${otherUserType}`;
        const typingData = typingStatus.get(typingKey);
        
        const now = Date.now();
        const isTyping = typingData?.isTyping === true && 
                        (now - typingData.timestamp.getTime()) < 5000;

        // Clean up
        cleanupTypingStatus();

        return NextResponse.json({
            success: true,
            isTyping,
            lastUpdate: typingData?.timestamp?.toISOString()
        });

    } catch (error: any) {
        console.error('Error checking typing status:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check typing status',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

function cleanupTypingStatus() {
    const now = Date.now();
    const maxAge = 10000;
    
    for (const [key, data] of typingStatus.entries()) {
        if (now - data.timestamp.getTime() > maxAge) {
            typingStatus.delete(key);
        }
    }
}