import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // MOCK DATA - Database table for notifications does not exist
        const mockNotifications = [
            {
                id: 1,
                type: 'system',
                title: 'Welcome to EventBridge',
                message: 'Complete your profile to start getting leads.',
                isRead: false,
                createdAt: new Date().toISOString(),
                link: '/vendor/profile'
            },
            {
                id: 2,
                type: 'booking',
                title: 'New Booking Request',
                message: 'Sarah Jenkins requested a booking for Oct 24.',
                isRead: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                link: '/vendor/bookings'
            }
        ];

        const unreadCount = mockNotifications.filter(n => !n.isRead).length;

        return NextResponse.json({
            notifications: mockNotifications,
            unreadCount: unreadCount
        });

    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
}

export async function PATCH(req: NextRequest) {
    // Mock patch - success
    return NextResponse.json({ success: true });
}
