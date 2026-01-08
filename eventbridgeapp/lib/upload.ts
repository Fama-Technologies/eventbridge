export type UploadType = 'profile' | 'gallery' | 'document';

export const uploadToBlob = async (
  file: File,
  type: UploadType
): Promise<string> => {
  // Step 1: Ask server for a signed upload URL
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      type,
    }),
  });

  const data: {
    uploadUrl: string;
    publicUrl: string;
    error?: string;
  } = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to get upload URL');
  }

  // Step 2: Upload file directly to Vercel Blob
  const uploadRes = await fetch(data.uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error('Upload failed');
  }

  // Step 3: Return public file URL
  return data.publicUrl;
};
