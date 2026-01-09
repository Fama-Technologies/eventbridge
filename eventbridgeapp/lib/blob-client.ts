'use client';

import { upload } from '@vercel/blob/client';

export type UploadFolder = 'profiles' | 'gallery' | 'documents';

export async function uploadToBlob(
  file: File,
  folder: UploadFolder
): Promise<string> {
  const blob = await upload(
    `${folder}/${Date.now()}-${file.name}`,
    file,
    {
        access: 'public',
        contentType: file.type,
        handleUploadUrl: '/api/upload'
    }
  );

  return blob.url;
}
