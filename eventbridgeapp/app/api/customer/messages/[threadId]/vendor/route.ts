import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

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

        // Get thread and vendor info
        const [threadInfo] = await db
            .select({
                vendorId: messageThreads.vendorId,
                vendor: {
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    email: users.email,
                    phone: users.phone,
                },
                vendorProfile: {
                    businessName: vendorProfiles.businessName,
                    description: vendorProfiles.description,
                    city: vendorProfiles.city,
                    rating: vendorProfiles.rating,
                    reviewCount: vendorProfiles.reviewCount,
                    profileImage: vendorProfiles.profileImage,
                    coverImage: vendorProfiles.coverImage,
                    isVerified: vendorProfiles.isVerified,
                    responseTime: 'Usually responds within 1 hour', // Default
                }
            })
            .from(messageThreads)
            .innerJoin(users, eq(messageThreads.vendorId, users.id))
            .leftJoin(vendorProfiles, eq(messageThreads.vendorId, vendorProfiles.userId))
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    eq(messageThreads.customerId, userId)
                )
            )
            .limit(1);

        if (!threadInfo) {
            return NextResponse.json(
                { success: false, error: 'Thread not found' },
                { status: 404 }
            );
        }

        // Check if vendor is online (you'll need to implement this)
        const online = await checkVendorOnline(threadInfo.vendorId);

        const vendorInfo = {
            id: threadInfo.vendor.id,
            name: threadInfo.vendorProfile?.businessName || 
                  `${threadInfo.vendor.firstName} ${threadInfo.vendor.lastName}`,
            avatar: threadInfo.vendorProfile?.profileImage,
            online,
            lastSeen: new Date(), // You should track this separately
            businessName: threadInfo.vendorProfile?.businessName,
            rating: threadInfo.vendorProfile?.rating,
            responseTime: threadInfo.vendorProfile?.responseTime,
            email: threadInfo.vendor.email,
            phone: threadInfo.vendor.phone,
        };

        return NextResponse.json({
            success: true,
            vendor: vendorInfo
        });

    } catch (error: any) {
        console.error('Error fetching vendor info:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch vendor info',
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

async function checkVendorOnline(vendorId: number): Promise<boolean> {
    // Implement your online status checking logic here
    // This could be based on last active timestamp, WebSocket connections, etc.
    return false; // Default to offline
}