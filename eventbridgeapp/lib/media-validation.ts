// lib/media-validation.ts
const MAX_IMAGES = 10;
const MAX_VIDEOS = 10;
const MIN_IMAGE_WIDTH = 1920;
const MIN_IMAGE_HEIGHT = 1080;
const MIN_VIDEO_WIDTH = 1280;
const MIN_VIDEO_HEIGHT = 720;
const MAX_FILE_SIZE_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_FILE_SIZE_VIDEO = 100 * 1024 * 1024; // 100MB

export interface MediaValidationResult {
  valid: boolean;
  errors: string[];
  quality: 'high' | 'medium' | 'low';
}

export function validateImageQuality(
  width: number,
  height: number,
  fileSize: number
): MediaValidationResult {
  const errors: string[] = [];
  let quality: 'high' | 'medium' | 'low' = 'low';

  if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
    errors.push(
      `Image resolution too low. Minimum: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px. Uploaded: ${width}x${height}px`
    );
  }

  if (fileSize > MAX_FILE_SIZE_IMAGE) {
    errors.push(`Image too large. Maximum: 10MB. Uploaded: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
  }

  // Determine quality
  if (width >= 3840 && height >= 2160) quality = 'high'; // 4K
  else if (width >= MIN_IMAGE_WIDTH && height >= MIN_IMAGE_HEIGHT) quality = 'medium';

  return { valid: errors.length === 0, errors, quality };
}

export function validateVideoQuality(
  width: number,
  height: number,
  fileSize: number,
  duration: number
): MediaValidationResult {
  const errors: string[] = [];
  let quality: 'high' | 'medium' | 'low' = 'low';

  if (width < MIN_VIDEO_WIDTH || height < MIN_VIDEO_HEIGHT) {
    errors.push(
      `Video resolution too low. Minimum: ${MIN_VIDEO_WIDTH}x${MIN_VIDEO_HEIGHT}px. Uploaded: ${width}x${height}px`
    );
  }

  if (fileSize > MAX_FILE_SIZE_VIDEO) {
    errors.push(`Video too large. Maximum: 100MB. Uploaded: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);
  }

  if (duration > 300) {
    errors.push(`Video too long. Maximum: 5 minutes. Uploaded: ${(duration / 60).toFixed(1)} minutes`);
  }

  // Determine quality
  if (width >= 1920 && height >= 1080) quality = 'high'; // 1080p+
  else if (width >= MIN_VIDEO_WIDTH && height >= MIN_VIDEO_HEIGHT) quality = 'medium'; // 720p

  return { valid: errors.length === 0, errors, quality };
}

export function validateMediaCount(
  currentImageCount: number,
  currentVideoCount: number,
  newImages: number,
  newVideos: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (currentImageCount + newImages > MAX_IMAGES) {
    errors.push(`Maximum ${MAX_IMAGES} images allowed.`);
  }

  if (currentVideoCount + newVideos > MAX_VIDEOS) {
    errors.push(`Maximum ${MAX_VIDEOS} videos allowed.`);
  }

  return { valid: errors.length === 0, errors };
}