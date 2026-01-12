// app/api/vendor/portfolio/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users, vendorProfiles, vendorPortfolio, userUploads, sessions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Increase max body size for file uploads (adjust as needed)
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getCurrentUser() {
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
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    if (user.accountType !== 'VENDOR') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized - Vendor only' 
      }, { status: 403 });
    }

    // Get vendor profile
    const [vendorProfile] = await db
      .select()
      .from(vendorProfiles)
      .where(eq(vendorProfiles.userId, user.id))
      .limit(1);

    if (!vendorProfile) {
      return NextResponse.json({ 
        success: false, 
        error: 'Vendor profile not found' 
      }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Get image dimensions
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/portfolio');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Save file to disk
    await writeFile(filePath, buffer);

    // Public URL for the image
    const imageUrl = `/uploads/portfolio/${fileName}`;
    const fileKey = `portfolio/${fileName}`;

    // Get image dimensions (basic - you might want to use sharp or another library)
    let width = null;
    let height = null;
    try {
      // If you have sharp installed: const metadata = await sharp(buffer).metadata();
      // width = metadata.width; height = metadata.height;
    } catch (error) {
      console.log('Could not get image dimensions:', error);
    }

    // Save to user_uploads table
    const [upload] = await db
      .insert(userUploads)
      .values({
        userId: user.id,
        vendorId: vendorProfile.id,
        fileKey: fileKey,
        fileUrl: imageUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadType: 'portfolio',
        width: width,
        height: height,
        createdAt: new Date(),
      })
      .returning();

    // Save to vendor_portfolio table
    const [portfolioItem] = await db
      .insert(vendorPortfolio)
      .values({
        vendorId: vendorProfile.id,
        imageUrl: imageUrl,
        title: title || null,
        description: description || null,
        category: category || null,
        width: width,
        height: height,
        fileSize: file.size,
        quality: null,
        displayOrder: 0,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        portfolioItem,
        upload,
      },
      message: 'Portfolio image uploaded successfully'
    });

  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload image. Please try again.' 
    }, { status: 500 });
  }
}