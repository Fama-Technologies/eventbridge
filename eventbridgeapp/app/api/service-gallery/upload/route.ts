import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { db } from '@/lib/db';
import { serviceGallery } from '@/drizzle/schema';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const files = formData.getAll('files') as File[];
    const serviceIdRaw = formData.get('serviceId');

    
    const serviceId = Number(serviceIdRaw);

    if (!files.length || !serviceIdRaw || Number.isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Missing or invalid data' },
        { status: 400 }
      );
    }

    const uploads: { url: string; type: 'image' | 'video' }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const isVideo = file.type.startsWith('video/');

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: isVideo ? 'video' : 'image',
              folder: 'service-gallery',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      });

    
      await db.insert(serviceGallery).values({
        serviceId,
        mediaUrl: uploadResult.secure_url,
        mediaType: isVideo ? 'video' : 'image',
      });

      uploads.push({
        url: uploadResult.secure_url,
        type: isVideo ? 'video' : 'image',
      });
    }

    return NextResponse.json({ success: true, uploads });
  } catch (error) {
    console.error('Service gallery upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
