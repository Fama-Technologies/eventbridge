import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageThreads } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

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

        // Parse request body
        const { isTyping } = await req.json();

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

        // In a real implementation, this would broadcast via WebSocket
        // For now, we just acknowledge the typing indicator
        // The WebSocket server handles the actual broadcasting

        return NextResponse.json({
            success: true,
            data: {
                threadId,
                userId: user.id,
                userType: 'vendor',
                isTyping: !!isTyping,
                recipientId: thread[0].customerId
            }
        });

    } catch (error) {
        console.error('Error sending typing indicator:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
