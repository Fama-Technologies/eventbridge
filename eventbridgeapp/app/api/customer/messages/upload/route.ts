import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const userId = await getAuthenticatedUserId(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const threadId = formData.get('threadId') as string;
        const type = formData.get('type') as string;

        if (!file || !threadId || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify user has access to this thread
        const thread = await db
            .select()
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, parseInt(threadId)),
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

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'text/plain', 'audio/mpeg', 'video/mp4'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'File type not allowed' },
                { status: 400 }
            );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'messages');
        if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const uniqueName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`;
        const filePath = join(uploadsDir, uniqueName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // File URL for frontend
        const fileUrl = `/uploads/messages/${uniqueName}`;

        // Insert message with attachment
        const [newMessage] = await db
            .insert(messages)
            .values({
                threadId: parseInt(threadId),
                senderId: userId,
                senderType: 'CUSTOMER',
                content: '',
                attachments: [{
                    id: `att-${timestamp}`,
                    type: type,
                    url: fileUrl,
                    name: file.name,
                    size: file.size,
                }],
                read: true,
                createdAt: new Date(),
            })
            .returning();

        // Update thread
        await db
            .update(messageThreads)
            .set({
                lastMessage: `Sent a ${type} file`,
                lastMessageTime: new Date(),
                vendorUnreadCount: (thread[0].vendorUnreadCount || 0) + 1,
                updatedAt: new Date()
            })
            .where(eq(messageThreads.id, parseInt(threadId)));

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                threadId: newMessage.threadId,
                senderId: newMessage.senderId,
                senderType: newMessage.senderType,
                content: newMessage.content,
                attachments: newMessage.attachments,
                timestamp: newMessage.createdAt,
                read: newMessage.read,
            },
            attachment: {
                id: `att-${timestamp}`,
                type: type,
                url: fileUrl,
                name: file.name,
                size: file.size,
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload file',
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