import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Store typing status in memory (for production, use Redis or similar)
const typingStatus = new Map<string, { isTyping: boolean; timestamp: Date }>();

export async function POST(
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
        const { isTyping } = await req.json();

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

        // Store typing status
        typingStatus.set(`thread-${threadId}-customer`, {
            isTyping,
            timestamp: new Date()
        });

        // You could emit a WebSocket event here to notify the vendor
        // For now, we'll just acknowledge the request

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
                details: error.message
            },
            { status: 500 }
        );
    }
}

// Check if someone is typing
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

        // Check if vendor is typing
        const vendorTyping = typingStatus.get(`thread-${threadId}-vendor`);
        const isTyping = vendorTyping?.isTyping === true && 
                        (Date.now() - vendorTyping.timestamp.getTime()) < 3000; // Within last 3 seconds

        return NextResponse.json({
            success: true,
            isTyping,
            lastTyped: vendorTyping?.timestamp
        });

    } catch (error: any) {
        console.error('Error checking typing status:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to check typing status',
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