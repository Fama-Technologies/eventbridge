import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the file and type from form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type based on upload type
    let allowedTypes: string[];
    let maxSize: number;

    if (type === 'document') {
      allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      maxSize = 10 * 1024 * 1024; // 10MB for documents
    } else {
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      maxSize = 5 * 1024 * 1024; // 5MB for images
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Determine folder based on type
    let folder = 'uploads';
    if (type === 'profile') folder = 'profiles';
    if (type === 'gallery') folder = 'gallery';
    if (type === 'document') folder = 'documents';

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const filename = `${folder}/vendor-${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Optional: Delete endpoint
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      );
    }

    const { del } = await import('@vercel/blob');
    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}