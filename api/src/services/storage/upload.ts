import { supabase } from '../../db/client.js';

export interface UploadResult {
  storagePath: string;
  publicUrl: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/heic',
]);

export function isAllowedFile(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export async function uploadToStorage(
  bucket: string,
  path: string,
  data: Buffer,
  mimeType: string,
): Promise<UploadResult> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { storagePath: path, publicUrl: urlData.publicUrl };
}

export function buildStoragePath(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${Date.now()}_${safe}`;
}
