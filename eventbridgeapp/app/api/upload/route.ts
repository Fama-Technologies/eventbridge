export const config = {
  runtime: 'nodejs',
};

import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as HandleUploadBody;

    try {
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async (pathname) => {
          // Validate file type based on pathname
          const ext = pathname.split('.').pop()?.toLowerCase();
          
          const allowedImageExts = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
          const allowedDocExts = ['pdf', ...allowedImageExts];
          
          if (!ext || !allowedDocExts.includes(ext)) {
            throw new Error('Invalid file type');
          }

          return {
            allowedContentTypes: [
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/webp',
              'image/heic',
              'image/heif',
              'application/pdf',
            ],
            tokenPayload: JSON.stringify({
              userId: user.id,
            }),
          };
        },
        onUploadCompleted: async ({ blob, tokenPayload }) => {
          console.log('Upload completed:', blob.url);
          
          // You can save the blob info to your database here if needed
          // const payload = JSON.parse(tokenPayload || '{}');
        },
      });

      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Upload init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize upload' },
      { status: 500 }
    );
  }
}