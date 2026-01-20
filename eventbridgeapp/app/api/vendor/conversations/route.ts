import { NextResponse } from 'next/server';

export async function GET() {
    const conversations = [
        {
            id: 'conv-1',
            name: 'Sarah Jenkins',
            avatar: '/avatars/sarah.png', // We'll make sure this path works or use a fallback
            eventId: 'evt_001',
            eventName: "Sarah's Wedding",
            eventType: "Sarah's Wedding",
            lastMessage: 'Perfect, thank you so much for the quick response! Looking forward to seeing the final setup.',
            timestamp: 'Oct 24, 02:45 PM',
            status: 'confirmed',
            isVerified: true,
            unreadCount: 1,
            unread: true,
            eventDetails: {
                date: 'Oct 24, 2024',
                time: '04:00 PM',
                venue: 'Grand Regency Hall, Room 4B',
                guests: 150
            },
            sharedFiles: [
                { name: 'Floral_Proposal_v2.pdf', size: '2.4 MB', date: 'Oct 15', type: 'pdf' },
                { name: 'Mood_Board_Ref.png', size: '1.1 MB', date: 'Today', type: 'image' }
            ],
            messages: [
                {
                    id: 'm1',
                    conversationId: 'conv-1',
                    content: 'Hi David! We were just reviewing the floral proposal you sent last week. Everything looks amazing! We just had one question about the peonies.',
                    timestamp: '02:00 PM',
                    sender: 'user'
                },
                {
                    id: 'm2',
                    conversationId: 'conv-1',
                    content: "Hello Sarah! I'm so glad to hear that. I'm happy to answer any questions. What would you like to know about the peonies?",
                    timestamp: '02:15 PM',
                    sender: 'vendor'
                },
                {
                    id: 'm3',
                    conversationId: 'conv-1',
                    content: 'Perfect, thank you so much for the quick response! Looking forward to seeing the final setup.',
                    timestamp: '02:45 PM',
                    sender: 'user'
                }
            ]
        },
        {
            id: 'conv-2',
            name: 'Tech Corp Mixer',
            avatar: '',
            eventId: 'evt_002',
            eventName: 'Tech Corp Mixer',
            eventType: 'Corporate Event',
            lastMessage: 'We have reviewed the initial quote and would like to request some changes to the catering menu...',
            timestamp: 'Nov 02, 10:15 AM',
            status: 'pending-quote',
            unreadCount: 0,
            unread: false,
            eventDetails: {
                date: 'Dec 12, 2024',
                time: '06:00 PM',
                venue: 'Tech Hub Conference Center',
                guests: 500
            },
            sharedFiles: [],
            messages: [
                {
                    id: 'm4',
                    conversationId: 'conv-2',
                    content: 'We have reviewed the initial quote and would like to request some changes to the catering menu...',
                    timestamp: '10:15 AM',
                    sender: 'user'
                }
            ]
        }
    ];

    return NextResponse.json({ conversations });
}
