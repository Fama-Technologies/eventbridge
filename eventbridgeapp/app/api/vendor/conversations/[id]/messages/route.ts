import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, conversationParticipants, conversations } from '@/drizzle/schema';
import { eq, asc, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getAuthUser(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const conversationId = parseInt(params.id);
        if (isNaN(conversationId)) return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });

        // Verify participation
        const [participant] = await db
            .select()
            .from(conversationParticipants)
            .where(and(
                eq(conversationParticipants.conversationId, conversationId),
                eq(conversationParticipants.userId, user.id)
            ));

        if (!participant) {
            return NextResponse.json({ message: 'Not authorized for this conversation' }, { status: 403 });
        }

        // Fetch messages
        const msgs = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(asc(messages.createdAt));

        const formattedMessages = msgs.map((m: any) => ({
            id: String(m.id),
            conversationId: String(m.conversationId),
            content: m.content || '',
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender: m.senderId === user.id ? 'vendor' : 'user', // Assuming this API is used by vendor, 'user' here means 'other side' but UI expects 'user' or 'vendor' string literally.
            // Wait, if I am the vendor, senderId === myId means 'vendor' (me).
            // If senderId !== myId, it means 'user' (client).
            // Logic check: The UI uses 'vendor' for the current user (right side) and 'user' for the other person (left side).
            attachments: m.attachments || []
        }));

        return NextResponse.json({ messages: formattedMessages });
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

        const conversationId = parseInt(params.id);
        const formData = await req.formData();
        const content = formData.get('content') as string;

        // Attachments handling would go here (upload to S3/Blob then store URL)
        // For now, ignoring file uploads implementation for brevity unless requested specifically
        // Assuming simple text for this step

        if (!content) {
            return NextResponse.json({ message: 'Content required' }, { status: 400 });
        }

        // Insert message
        const [newMessage] = await db.insert(messages).values({
            conversationId,
            senderId: user.id,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        // Update conversation timestamp
        await db.update(conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(conversations.id, conversationId));

        return NextResponse.json({
            message: {
                id: String(newMessage.id),
                content: newMessage.content,
                timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'vendor',
                attachments: []
            }
        });

    } catch (error) {
        console.error('Failed to send message:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
