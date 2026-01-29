import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, bookings, vendorPackages, users, vendorProfiles } from '@/drizzle/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

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
                id: messageThreads.id,
                bookingId: messageThreads.bookingId,
                customerId: messageThreads.customerId
            })
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

        const threadData = thread[0];

        // If no booking associated
        if (!threadData.bookingId) {
            return NextResponse.json({
                success: true,
                quote: null,
                message: 'No booking associated with this thread'
            });
        }

        // Get booking details
        const booking = await db
            .select({
                booking: {
                    id: bookings.id,
                    status: bookings.status,
                    totalAmount: bookings.totalAmount,
                    bookingDate: bookings.bookingDate,
                    startTime: bookings.startTime,
                    endTime: bookings.endTime,
                    notes: bookings.notes
                },
                package: {
                    id: vendorPackages.id,
                    name: vendorPackages.name,
                    description: vendorPackages.description,
                    price: vendorPackages.price
                },
                vendor: {
                    id: users.id,
                    name: users.firstName + ' ' + users.lastName
                }
            })
            .from(bookings)
            .leftJoin(vendorPackages, eq(bookings.packageId, vendorPackages.id))
            .leftJoin(vendorProfiles, eq(bookings.vendorId, vendorProfiles.id))
            .leftJoin(users, eq(vendorProfiles.userId, users.id))
            .where(
                and(
                    eq(bookings.id, threadData.bookingId),
                    eq(bookings.clientId, userId)
                )
            )
            .limit(1);

        if (booking.length === 0) {
            return NextResponse.json({
                success: true,
                quote: null,
                message: 'Booking not found'
            });
        }

        const bookingData = booking[0];
        
        // Format quote
        const quote = {
            id: `quote-${bookingData.booking.id}`,
            bookingId: bookingData.booking.id,
            title: bookingData.package?.name || 'Custom Service',
            description: bookingData.package?.description || bookingData.booking.notes || 'Service request',
            amount: bookingData.booking.totalAmount || bookingData.package?.price || 0,
            currency: 'UGX',
            formattedPrice: `UGX ${(bookingData.booking.totalAmount || bookingData.package?.price || 0).toLocaleString()}`,
            status: mapBookingStatusToQuoteStatus(bookingData.booking.status),
            createdAt: new Date(),
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };

        return NextResponse.json({
            success: true,
            quote,
            hasActiveQuote: quote.status === 'pending' || quote.status === 'negotiating'
        });

    } catch (error: any) {
        console.error('Error fetching quote:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch quote',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

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
                id: messageThreads.id,
                bookingId: messageThreads.bookingId
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    eq(messageThreads.customerId, userId),
                    isNotNull(messageThreads.bookingId)
                )
            )
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread or booking not found' },
                { status: 404 }
            );
        }

        const { notes, acceptTerms } = await req.json();
        
        if (acceptTerms !== true) {
            return NextResponse.json(
                { success: false, error: 'You must accept the terms to proceed' },
                { status: 400 }
            );
        }

        // Update booking status
        await db.update(bookings)
            .set({
                status: 'confirmed',
                paymentStatus: 'deposit_pending',
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(bookings.id, thread[0].bookingId!),
                    eq(bookings.clientId, userId),
                    eq(bookings.status, 'pending')
                )
            );

        return NextResponse.json({
            success: true,
            message: 'Quote accepted successfully',
            nextSteps: [
                'Pay 50% deposit to confirm booking',
                'Review booking details',
                'Contact vendor for any questions'
            ]
        });

    } catch (error: any) {
        console.error('Error accepting quote:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to accept quote',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
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
                id: messageThreads.id,
                bookingId: messageThreads.bookingId
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, threadId),
                    eq(messageThreads.customerId, userId),
                    isNotNull(messageThreads.bookingId)
                )
            )
            .limit(1);

        if (thread.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Thread or booking not found' },
                { status: 404 }
            );
        }

        const { reason } = await req.json();

        // Update booking status
        await db.update(bookings)
            .set({
                status: 'cancelled',
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(bookings.id, thread[0].bookingId!),
                    eq(bookings.clientId, userId),
                    eq(bookings.status, 'pending')
                )
            );

        return NextResponse.json({
            success: true,
            message: 'Quote rejected successfully'
        });

    } catch (error: any) {
        console.error('Error rejecting quote:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to reject quote',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

function mapBookingStatusToQuoteStatus(bookingStatus: string): string {
    const statusMap: Record<string, string> = {
        'pending': 'pending',
        'confirmed': 'accepted',
        'cancelled': 'rejected',
        'completed': 'completed'
    };
    
    return statusMap[bookingStatus] || 'pending';
}