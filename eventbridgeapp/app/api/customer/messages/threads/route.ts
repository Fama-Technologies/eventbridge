import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthUser(req);
        
        if (!authUser || authUser.accountType !== 'CUSTOMER') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = authUser.id;

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
                vendor: {
                    businessName: vendorProfiles.businessName,
                    city: vendorProfiles.city,
                    rating: vendorProfiles.rating,
                    profileImage: vendorProfiles.profileImage
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

        // Format response
        const formattedThreads = threads.map((thread: { id: any; vendorId: any; vendor: { businessName: any; profileImage: any; }; vendorName: any; vendorAvatar: any; lastMessage: any; lastMessageTime: any; unreadCount: any; }) => ({
            id: thread.id,
            vendorId: thread.vendorId,
            vendorName: thread.vendor?.businessName || thread.vendorName,
            vendorAvatar: thread.vendorAvatar || thread.vendor?.profileImage,
            lastMessage: thread.lastMessage || 'No messages yet',
            lastMessageTime: thread.lastMessageTime,
            unreadCount: thread.unreadCount || 0,
            online: false, // You'll need to implement online status
            vendor: thread.vendor
        }));

        return NextResponse.json({
            success: true,
            threads: formattedThreads,
            count: formattedThreads.length
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