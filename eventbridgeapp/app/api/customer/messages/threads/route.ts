import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, messages } from '@/drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        // Get user ID from token (you'll need to implement this)
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch message threads for the customer
        const threads = await db
            .select({
                id: messageThreads.id,
                vendorId: messageThreads.vendorId,
                vendorName: users.firstName,
                vendorAvatar: vendorProfiles.profileImage,
                lastMessage: messageThreads.lastMessage,
                lastMessageTime: messageThreads.lastMessageTime,
                unreadCount: messageThreads.customerUnreadCount,
                online: false, // You'll need to implement online status separately
                vendor: {
                    businessName: vendorProfiles.businessName,
                    city: vendorProfiles.city,
                    rating: vendorProfiles.rating,
                    responseTime: 'Usually responds within 1 hour', // Default
                }
            })
            .from(messageThreads)
            .innerJoin(users, eq(messageThreads.vendorId, users.id))
            .leftJoin(vendorProfiles, eq(messageThreads.vendorId, vendorProfiles.userId))
            .where(
                and(
                    eq(messageThreads.customerId, userId),
                    eq(messageThreads.isArchived, false),
                    eq(messageThreads.isBlocked, false)
                )
            )
            .orderBy(desc(messageThreads.lastMessageTime));

        return NextResponse.json({
            success: true,
            threads,
            count: threads.length
        });

    } catch (error: any) {
        console.error('Error fetching message threads:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch message threads',
                details: error.message
            },
            { status: 500 }
        );
    }
}

// Helper function to get user ID from token
async function getAuthenticatedUserId(req: NextRequest): Promise<number | null> {
    try {
        const token = req.cookies.get('auth-token')?.value;
        
        if (!token) {
            return null;
        }

        // Verify token and extract user ID
        // You'll need to implement your JWT verification logic here
        // For now, returning a test user ID
        return 1; // Replace with actual user ID from token
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { vendorId } = await req.json();

        if (!vendorId) {
            return NextResponse.json(
                { success: false, error: 'Vendor ID is required' },
                { status: 400 }
            );
        }

        // Check if thread already exists
        const existingThread = await db
            .select()
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.customerId, userId),
                    eq(messageThreads.vendorId, vendorId)
                )
            )
            .limit(1);

        if (existingThread.length > 0) {
            return NextResponse.json({
                success: true,
                thread: existingThread[0],
                message: 'Thread already exists'
            });
        }

        // Create new thread
        const [newThread] = await db
            .insert(messageThreads)
            .values({
                customerId: userId,
                vendorId: vendorId,
                customerUnreadCount: 0,
                vendorUnreadCount: 0,
                lastMessage: 'Conversation started',
                lastMessageTime: new Date(),
                isArchived: false,
                isBlocked: false,
            })
            .returning();

        return NextResponse.json({
            success: true,
            thread: newThread,
            message: 'Message thread created'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating message thread:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create message thread',
                details: error.message
            },
            { status: 500 }
        );
    }
}