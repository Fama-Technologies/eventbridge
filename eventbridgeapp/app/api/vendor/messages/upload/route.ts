import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { messageThreads } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser(req);

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (user.accountType !== 'VENDOR') {
            return NextResponse.json(
                { success: false, error: 'Access denied. Vendor account required.' },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const threadId = formData.get('threadId') as string;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
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
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'File type not allowed' },
                { status: 400 }
            );
        }

        // If threadId provided, verify vendor has access
        if (threadId) {
            const parsedThreadId = parseInt(threadId);
            if (!isNaN(parsedThreadId)) {
                const thread = await db
                    .select({ vendorId: messageThreads.vendorId })
                    .from(messageThreads)
                    .where(eq(messageThreads.id, parsedThreadId))
                    .limit(1);

                if (thread.length > 0 && thread[0].vendorId !== user.id) {
                    return NextResponse.json(
                        { success: false, error: 'Access denied to this thread' },
                        { status: 403 }
                    );
                }
            }
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `vendor-messages/${user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            addRandomSuffix: false,
        });

        // Determine file type category
        let fileType = 'document';
        if (file.type.startsWith('image/')) {
            fileType = 'image';
        } else if (file.type.startsWith('video/')) {
            fileType = 'video';
        } else if (file.type.startsWith('audio/')) {
            fileType = 'audio';
        }

        return NextResponse.json({
            success: true,
            fileUrl: blob.url,
            fileName: file.name,
            fileSize: file.size,
            fileType,
            mimeType: file.type
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
