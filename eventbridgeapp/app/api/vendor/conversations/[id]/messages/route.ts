import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // MOCK DATA
        const mockMessages = [
            {
                id: 'm1',
                conversationId: params.id,
                content: 'Hi! We were just reviewing the floral proposal you sent last week.',
                timestamp: '02:45 PM',
                sender: 'user',
                attachments: []
            },
            {
                id: 'm2',
                conversationId: params.id,
                content: "Hello! I'm happy to answer any questions.",
                timestamp: '02:48 PM',
                sender: 'vendor',
                attachments: []
            }
        ];

        return NextResponse.json({ messages: mockMessages });
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const content = formData.get('content') as string;

        // Return mock success response
        return NextResponse.json({
            message: {
                id: `m${Date.now()}`,
                content: content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'vendor',
                attachments: []
            }
        });

    } catch (error) {
        console.error('Failed to send message:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
