import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // MOCK DATA - Database tables for conversations do not exist
        const mockConversations = [
            {
                id: 'conv-1',
                name: 'Sarah Jenkins',
                avatar: '',
                eventName: "Sarah's Wedding",
                eventType: "Wedding",
                lastMessage: "I've attached a photo for reference!",
                timestamp: new Date().toLocaleString(),
                status: 'confirmed',
                unread: false,
                unreadCount: 0,
                messages: []
            },
            {
                id: 'conv-2',
                name: 'Tech Corp Mixer',
                avatar: '',
                eventName: 'Tech Corp Mixer',
                eventType: 'Corporate Event',
                lastMessage: 'We have reviewed the initial quote...',
                timestamp: new Date(Date.now() - 86400000).toLocaleString(),
                status: 'pending-quote',
                unread: true,
                unreadCount: 1,
                messages: []
            }
        ];

        return NextResponse.json({ conversations: mockConversations });

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
