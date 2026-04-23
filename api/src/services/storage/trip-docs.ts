import { supabase } from '../../db/client.js';
import { uploadToStorage, buildStoragePath, isAllowedFile } from './upload.js';
import type { TripItemType } from '../../db/types.js';

interface TripDocInput {
  attachments: Array<{ filename: string; mimeType: string; data: Buffer }>;
  tripId: string | null;
  tripItemId: string | null;
  type: TripItemType;
  userId: string;
  rawEmailId: string;
}

export async function processTripDocuments(input: TripDocInput): Promise<void> {
  const allowed = input.attachments.filter((a) => isAllowedFile(a.mimeType));

  for (const attachment of allowed) {
    const storagePath = buildStoragePath(input.userId, attachment.filename);
    await uploadToStorage('trip-documents', storagePath, attachment.data, attachment.mimeType);

    if (input.tripId) {
      await supabase.from('documents').insert({
        user_id: input.userId,
        trip_id: input.tripId,
        trip_item_id: input.tripItemId,
        type: input.type,
        file_name: attachment.filename,
        mime_type: attachment.mimeType,
        storage_path: storagePath,
        original_name: attachment.filename,
      });
    } else {
      await supabase.from('trip_items_to_review').insert({
        user_id: input.userId,
        type: input.type,
        raw_email_id: input.rawEmailId,
        file_name: attachment.filename,
        mime_type: attachment.mimeType,
        storage_path: storagePath,
        original_name: attachment.filename,
      });
    }
  }
}
