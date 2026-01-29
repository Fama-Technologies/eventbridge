import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messageThreads, bookings, vendorPackages } from '@/drizzle/schema';
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

        // Get booking for this thread
        const booking = await db
            .select({
                id: bookings.id,
                packageId: bookings.packageId,
                status: bookings.status,
                totalAmount: bookings.totalAmount,
                package: {
                    name: vendorPackages.name,
                    description: vendorPackages.description,
                    price: vendorPackages.price,
                }
            })
            .from(bookings)
            .leftJoin(vendorPackages, eq(bookings.packageId, vendorPackages.id))
            .where(
                and(
                    eq(bookings.id, thread[0].bookingId || 0),
                    eq(bookings.clientId, userId)
                )
            )
            .limit(1);

        if (booking.length === 0) {
            return NextResponse.json({
                success: true,
                quote: null,
                message: 'No active quote found'
            });
        }

        const bookingData = booking[0];
        
        // Mock quote data - you should have a separate quotes table
        const quote = {
            id: `quote-${bookingData.id}`,
            title: bookingData.package?.name || 'Custom Quote',
            description: bookingData.package?.description || 'Custom service package',
            price: `UGX ${bookingData.totalAmount || bookingData.package?.price || '0'}`,
            status: bookingData.status === 'pending' ? 'pending' : 
                    bookingData.status === 'confirmed' ? 'accepted' : 'expired',
            createdAt: new Date(),
            bookingId: bookingData.id,
            packageId: bookingData.packageId,
        };

        return NextResponse.json({
            success: true,
            quote,
            booking: bookingData
        });

    } catch (error: any) {
        console.error('Error fetching quote:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch quote',
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