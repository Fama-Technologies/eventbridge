import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { messages, messageThreads } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUser } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        // Authenticate user using existing auth helper
        const authUser = await getAuthUser(req);
        
        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = authUser.id;
        const userType = authUser.accountType;
        
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const threadId = formData.get('threadId') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'File is required' },
                { status: 400 }
            );
        }

        if (!threadId) {
            return NextResponse.json(
                { success: false, error: 'Thread ID is required' },
                { status: 400 }
            );
        }

        const parsedThreadId = parseInt(threadId);
        
        if (isNaN(parsedThreadId) || parsedThreadId <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid thread ID' },
                { status: 400 }
            );
        }

        // Verify user has access to this thread
        const thread = await db
            .select({
                id: messageThreads.id,
                customerId: messageThreads.customerId,
                vendorId: messageThreads.vendorId,
                vendorUnreadCount: messageThreads.vendorUnreadCount,
                customerUnreadCount: messageThreads.customerUnreadCount
            })
            .from(messageThreads)
            .where(
                and(
                    eq(messageThreads.id, parsedThreadId),
                    userType === 'CUSTOMER' 
                        ? eq(messageThreads.customerId, userId)
                        : eq(messageThreads.vendorId, userId)
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

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Determine file type from MIME type
        const getFileType = (mimeType: string): string => {
            if (mimeType.startsWith('image/')) return 'image';
            if (mimeType.startsWith('video/')) return 'video';
            if (mimeType.startsWith('audio/')) return 'audio';
            if (mimeType.includes('pdf')) return 'document';
            if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
            if (mimeType.includes('text')) return 'document';
            return 'document';
        };

        const fileType = getFileType(file.type);
        
        // Validate file type
        const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'video/mp4', 'video/webm', 'video/quicktime',
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!allowedMimeTypes.includes(file.type)) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'File type not allowed. Allowed types: images, videos, audio, PDF, documents' 
                },
                { status: 400 }
            );
        }

        // Generate unique filename for blob storage
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueName = `${timestamp}-${randomStr}-${safeFileName}`;
        
        let blobUrl = '';
        try {
            // Upload to Vercel Blob Storage
            const blob = await put(uniqueName, file, {
                access: 'public',
                contentType: file.type,
            });
            
            blobUrl = blob.url;
        } catch (blobError: any) {
            console.error('Error uploading to blob storage:', blobError);
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to upload file to storage',
                    details: process.env.NODE_ENV === 'development' ? blobError.message : undefined
                },
                { status: 500 }
            );
        }

        // Insert message with attachment
        const [newMessage] = await db
            .insert(messages)
            .values({
                threadId: parsedThreadId,
                senderId: userId,
                senderType: userType,
                content: '', // No text content for file-only messages
                attachments: [{
                    type: fileType,
                    url: blobUrl,
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    blobPath: uniqueName // Store the blob path for potential future reference
                }],
                read: false,
                createdAt: new Date(),
            })
            .returning();

        // Update thread - increment unread count for the other party
        const otherPartyField = userType === 'CUSTOMER' ? 'vendorUnreadCount' : 'customerUnreadCount';
        const currentUnreadCount = threadData[otherPartyField] || 0;
        
        await db
            .update(messageThreads)
            .set({
                lastMessage: `Sent a ${fileType} file: ${file.name}`,
                lastMessageTime: new Date(),
                [otherPartyField]: currentUnreadCount + 1,
                updatedAt: new Date()
            })
            .where(eq(messageThreads.id, parsedThreadId));

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                threadId: newMessage.threadId,
                senderId: newMessage.senderId,
                senderType: newMessage.senderType,
                content: newMessage.content,
                attachments: newMessage.attachments || [],
                timestamp: newMessage.createdAt,
                read: newMessage.read,
            },
            fileUrl: blobUrl,
            fileInfo: {
                type: fileType,
                name: file.name,
                size: file.size,
                mimeType: file.type,
                blobPath: uniqueName
            },
            notification: 'File uploaded successfully'
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to upload file',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}