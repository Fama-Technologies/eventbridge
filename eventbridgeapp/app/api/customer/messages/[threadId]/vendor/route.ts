// app/api/customer/messages/[threadId]/vendor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, users, vendorProfiles, vendorServices, vendorPortfolio } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { isUserOnline } from '@/lib/online-users';

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
        const userType = authUser.accountType;
        
        const threadId = parseInt(params.threadId);
        
        if (isNaN(threadId) || threadId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid thread ID' },
                { status: 400 }
            );
        }

        // Get thread info
        const thread = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                vendorId: messageThreads.vendorId
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

        const threadData = thread[0];
        
        // Check if user has access
        const hasAccess = threadData.customerId === userId || threadData.vendorId === userId;
        if (!hasAccess) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // Determine which user to fetch
        const targetUserId = threadData.customerId === userId ? threadData.vendorId : threadData.customerId;
        
        // Get user info
        const [userInfo] = await db
            .select({
                id: users.id,
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                phone: users.phone,
                image: users.image,
                accountType: users.accountType,
                createdAt: users.createdAt,
                vendorProfile: {
                    id: vendorProfiles.id,
                    businessName: vendorProfiles.businessName,
                    description: vendorProfiles.description,
                    city: vendorProfiles.city,
                    state: vendorProfiles.state,
                    address: vendorProfiles.address,
                    rating: vendorProfiles.rating,
                    reviewCount: vendorProfiles.reviewCount,
                    profileImage: vendorProfiles.profileImage,
                    coverImage: vendorProfiles.coverImage,
                    isVerified: vendorProfiles.isVerified,
                    yearsExperience: vendorProfiles.yearsExperience,
                    hourlyRate: vendorProfiles.hourlyRate,
                    serviceRadius: vendorProfiles.serviceRadius
                }
            })
            .from(users)
            .leftJoin(vendorProfiles, eq(users.id, vendorProfiles.userId))
            .where(eq(users.id, targetUserId))
            .limit(1);

        if (!userInfo) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Get vendor services if target is a vendor
        let services = [];
        let portfolioItems = [];
        
        if (userInfo.accountType === 'VENDOR' && userInfo.vendorProfile) {
            services = await db
                .select({
                    id: vendorServices.id,
                    name: vendorServices.name,
                    description: vendorServices.description,
                    price: vendorServices.price,
                    duration: vendorServices.duration
                })
                .from(vendorServices)
                .where(eq(vendorServices.vendorId, userInfo.vendorProfile.id))
                .limit(10);

            portfolioItems = await db
                .select({
                    id: vendorPortfolio.id,
                    imageUrl: vendorPortfolio.imageUrl,
                    title: vendorPortfolio.title,
                    description: vendorPortfolio.description
                })
                .from(vendorPortfolio)
                .where(eq(vendorPortfolio.vendorId, userInfo.vendorProfile.id))
                .limit(6);
        }

        // Check if user is online using the utility function
        const isOnline = isUserOnline(targetUserId);
        
        // Format response
        const result = {
            id: userInfo.id,
            name: userInfo.vendorProfile?.businessName || 
                  `${userInfo.firstName} ${userInfo.lastName}`,
            email: userInfo.email,
            phone: userInfo.phone,
            avatar: userInfo.vendorProfile?.profileImage || userInfo.image,
            accountType: userInfo.accountType,
            online: isOnline,
            lastSeen: new Date(),
            responseTime: 'Usually responds within 1 hour',
            
            ...(userInfo.accountType === 'VENDOR' && userInfo.vendorProfile ? {
                businessName: userInfo.vendorProfile.businessName,
                description: userInfo.vendorProfile.description,
                location: {
                    city: userInfo.vendorProfile.city,
                    state: userInfo.vendorProfile.state,
                    address: userInfo.vendorProfile.address,
                    serviceRadius: userInfo.vendorProfile.serviceRadius
                },
                rating: {
                    score: userInfo.vendorProfile.rating,
                    count: userInfo.vendorProfile.reviewCount
                },
                experience: userInfo.vendorProfile.yearsExperience,
                hourlyRate: userInfo.vendorProfile.hourlyRate,
                verification: {
                    status: userInfo.vendorProfile.verificationStatus,
                    isVerified: userInfo.vendorProfile.isVerified
                },
                coverImage: userInfo.vendorProfile.coverImage,
                services: services,
                portfolio: portfolioItems,
                stats: {
                    totalServices: services.length,
                    totalPortfolio: portfolioItems.length,
                    memberSince: new Date(userInfo.createdAt).getFullYear()
                }
            } : {})
        };

        return NextResponse.json({
            success: true,
            user: result
        });

    } catch (error: any) {
        console.error('Error fetching user info:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user information',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}