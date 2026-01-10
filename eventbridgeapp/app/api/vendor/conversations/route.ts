import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, conversationParticipants, messages, users, events } from '@/drizzle/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch conversations where the user is a participant
        // Using a simpler approach: get participant records for user, then fetch conversations
        const userConversations = await db
            .select({
                conversationId: conversationParticipants.conversationId,
                unreadCount: sql<number>`count(case when ${messages.createdAt} > ${conversationParticipants.lastReadAt} or ${conversationParticipants.lastReadAt} is null then 1 end)`,
                lastReadAt: conversationParticipants.lastReadAt,
            })
            .from(conversationParticipants)
            .leftJoin(messages, eq(messages.conversationId, conversationParticipants.conversationId))
            .where(eq(conversationParticipants.userId, user.id))
            .groupBy(conversationParticipants.conversationId, conversationParticipants.lastReadAt);

        if (userConversations.length === 0) {
            return NextResponse.json({ conversations: [] });
        }

        const conversationIds = userConversations.map((c: { conversationId: number }) => c.conversationId);

        // Fetch conversation details with last message and other participant
        // Note: detailed query might be complex in one go, doing a join
        const convData = await db
            .select({
                id: conversations.id,
                createdAt: conversations.createdAt,
                lastMessageAt: conversations.lastMessageAt,
                eventName: events.title,
                eventType: events.description, // using description as type placeholder or join category
                eventId: events.id,
            })
            .from(conversations)
            .leftJoin(events, eq(conversations.eventId, events.id))
            .where(sql`${conversations.id} IN ${conversationIds}`)
            .orderBy(desc(conversations.lastMessageAt));

        // For each conversation, get the other participant and last message
        const formattedConversations = await Promise.all(convData.map(async (conv: any) => {
            // Get other participant
            const [otherPart] = await db
                .select({
                    firstName: users.firstName,
                    lastName: users.lastName,
                    image: users.image,
                })
                .from(conversationParticipants)
                .leftJoin(users, eq(conversationParticipants.userId, users.id))
                .where(and(
                    eq(conversationParticipants.conversationId, conv.id),
                    sql`${conversationParticipants.userId} != ${user.id}`
                ))
                .limit(1);

            // Get last message content
            const [lastMsg] = await db
                .select({ content: messages.content, createdAt: messages.createdAt })
                .from(messages)
                .where(eq(messages.conversationId, conv.id))
                .orderBy(desc(messages.createdAt))
                .limit(1);

            const userConv = userConversations.find((uc: { conversationId: number }) => uc.conversationId === conv.id);

            return {
                id: String(conv.id),
                name: otherPart ? `${otherPart.firstName} ${otherPart.lastName}` : 'Unknown User',
                avatar: otherPart?.image || '',
                eventName: conv.eventName || 'General Inquiry',
                eventType: 'Inquiry', // could clarify this
                lastMessage: lastMsg?.content || 'No messages yet',
                timestamp: lastMsg ? new Date(lastMsg.createdAt).toLocaleString() : new Date(conv.lastMessageAt!).toLocaleString(),
                status: 'confirmed', // placeholder status
                unread: Number(userConv?.unreadCount) > 0,
                unreadCount: Number(userConv?.unreadCount),
                messages: [], // summary list doesn't need full history
            };
        }));

        return NextResponse.json({ conversations: formattedConversations });

    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
