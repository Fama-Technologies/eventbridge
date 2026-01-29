import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookings, invoices } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function POST(
    req: NextRequest,
    { params }: { params: { quoteId: string } }
) {
    try {
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const quoteId = params.quoteId.replace('quote-', '');
        const bookingId = parseInt(quoteId);

        if (isNaN(bookingId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid quote ID' },
                { status: 400 }
            );
        }

        // Get booking
        const booking = await db
            .select()
            .from(bookings)
            .where(
                eq(bookings.id, bookingId)
            )
            .limit(1);

        if (booking.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Booking not found' },
                { status: 404 }
            );
        }

        const bookingData = booking[0];

        // Verify user owns this booking
        if (bookingData.clientId !== userId) {
            return NextResponse.json(
                { success: false, error: 'Access denied' },
                { status: 403 }
            );
        }

        // Update booking status
        await db
            .update(bookings)
            .set({
                status: 'confirmed',
                updatedAt: new Date()
            })
            .where(eq(bookings.id, bookingId));

        // Create invoice
        const invoiceNumber = `INV-${Date.now()}-${bookingId}`;
        
        const [newInvoice] = await db
            .insert(invoices)
            .values({
                vendorId: bookingData.vendorId,
                bookingId: bookingId,
                invoiceNumber,
                clientId: userId,
                amount: bookingData.totalAmount || '0',
                currency: 'UGX',
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                notes: 'Quote accepted via chat',
                metadata: {
                    acceptedAt: new Date().toISOString(),
                    acceptedBy: userId,
                }
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: 'Quote accepted successfully',
            booking: {
                id: bookingId,
                status: 'confirmed',
            },
            invoice: {
                id: newInvoice.id,
                invoiceNumber: newInvoice.invoiceNumber,
                amount: newInvoice.amount,
                dueDate: newInvoice.dueDate,
                status: newInvoice.status,
            }
        });

    } catch (error: any) {
        console.error('Error accepting quote:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to accept quote',
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