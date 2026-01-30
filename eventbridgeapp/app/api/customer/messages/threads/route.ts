// app/api/customer/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, sessions } from '@/drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('session')?.value;
        const authToken = cookieStore.get('auth-token')?.value;

        if (!sessionToken && !authToken) {
            return null;
        }

        if (sessionToken) {
            const [session] = await db
                .select()
                .from(sessions)
                .where(eq(sessions.token, sessionToken))
                .limit(1);

            if (session && new Date(session.expiresAt) >= new Date()) {
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, session.userId))
                    .limit(1);

                return user || null;
            }
        }

        return null;
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return null;
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const threads = await db
            .select({
                id: messageThreads.id,
                vendorId: messageThreads.vendorId,
                customerId: messageThreads.customerId,
                vendorName: users.firstName,
                vendorAvatar: vendorProfiles.profileImage,
                lastMessage: messageThreads.lastMessage,
                lastMessageTime: messageThreads.lastMessageTime,
                unreadCount: user.accountType === 'CUSTOMER' 
                    ? messageThreads.customerUnreadCount 
                    : messageThreads.vendorUnreadCount,
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
                    user.accountType === 'CUSTOMER'
                        ? eq(messageThreads.customerId, user.id)
                        : eq(messageThreads.vendorId, user.id),
                    eq(messageThreads.isArchived, false),
                    eq(messageThreads.isBlocked, false)
                )
            )
            .orderBy(desc(messageThreads.lastMessageTime));

        const formattedThreads = threads.map((thread: { id: any; vendorId: any; customerId: any; vendor: { businessName: any; profileImage: any; }; vendorName: any; vendorAvatar: any; lastMessage: any; lastMessageTime: any; unreadCount: any; }) => ({
            id: thread.id,
            vendorId: thread.vendorId,
            customerId: thread.customerId,
            vendorName: thread.vendor?.businessName || thread.vendorName,
            vendorAvatar: thread.vendorAvatar || thread.vendor?.profileImage,
            lastMessage: thread.lastMessage || 'No messages yet',
            lastMessageTime: thread.lastMessageTime,
            unreadCount: thread.unreadCount || 0,
            online: false,
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