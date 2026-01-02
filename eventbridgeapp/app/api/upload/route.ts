import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2, generatePresignedUploadUrl } from '@/lib/r2';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, sessions, userUploads } from '@/drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Upload limits per type
const UPLOAD_LIMITS = {
  profile: 1,
  cover: 1,
  gallery: 10,
  video: 5,
  document: 5,
};

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const sessionToken = cookieStore.get('session')?.value;

    if (authToken) {
      try {
        const payload = await verifyToken(authToken);
        if (payload && payload.userId) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, payload.userId as number))
            .limit(1);
          return user;
        }
      } catch (error) {
        console.error('Token verification failed:', error);
      }
    }

    if (sessionToken) {
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.token, sessionToken))
        .limit(1);

      if (session && new Date(session.expiresAt) >= new Date()) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);
        return user;
      }
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

async function getUploadCount(userId: number, uploadType: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userUploads)
    .where(
      and(
        eq(userUploads.userId, userId),
        eq(userUploads.uploadType, uploadType)
      )
    );
  
  return result[0]?.count || 0;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, fileSize, uploadType, width, height } = body;

    // Validate upload type
    const validUploadTypes = ['profile', 'cover', 'gallery', 'video', 'document'];
    if (!validUploadTypes.includes(uploadType)) {
      return NextResponse.json(
        { error: 'Invalid upload type' },
        { status: 400 }
      );
    }

    // Check upload limits
    const currentCount = await getUploadCount(user.id, uploadType);
    const limit = UPLOAD_LIMITS[uploadType as keyof typeof UPLOAD_LIMITS];
    
    if (currentCount >= limit) {
      return NextResponse.json(
        { error: `Maximum ${limit} ${uploadType} file(s) allowed. Delete existing files first.` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = uploadType === 'video' ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
    if (fileSize > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    let allowedTypes: string[] = [];
    if (uploadType === 'video') {
      allowedTypes = ALLOWED_VIDEO_TYPES;
    } else if (uploadType === 'document') {
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
    } else {
      allowedTypes = ALLOWED_IMAGE_TYPES;
    }

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: `File type ${fileType} not allowed for ${uploadType}` },
        { status: 400 }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${uploadType}s/${user.id}/${timestamp}-${sanitizedFileName}`;

    // Generate presigned URL
    const uploadUrl = await generatePresignedUploadUrl(key, fileType);
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    // Track upload in database
    const [upload] = await db
      .insert(userUploads)
      .values({
        userId: user.id,
        fileKey: key,
        fileUrl: publicUrl,
        fileName: sanitizedFileName,
        fileType,
        fileSize,
        uploadType,
        width: width || null,
        height: height || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      uploadUrl,
      publicUrl,
      key,
      uploadId: upload.id,
    });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate upload URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove uploads
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('id');

    if (!uploadId) {
      return NextResponse.json({ error: 'Upload ID required' }, { status: 400 });
    }

    // Get upload record
    const [upload] = await db
      .select()
      .from(userUploads)
      .where(
        and(
          eq(userUploads.id, parseInt(uploadId)),
          eq(userUploads.userId, user.id)
        )
      )
      .limit(1);

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    // Delete from R2
    await deleteFromR2(upload.fileKey);

    // Delete from database
    await db
      .delete(userUploads)
      .where(eq(userUploads.id, parseInt(uploadId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete upload' },
      { status: 500 }
    );
  }
}