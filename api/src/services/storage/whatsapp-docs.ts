import { supabase } from '../../db/client.js';
import { uploadToStorage, buildStoragePath, isAllowedFile } from './upload.js';

interface WhatsappDocInput {
  data: Buffer;
  mimeType: string;
  filename: string;
  messageId: string;
  phoneNumber: string;
}

export async function processWhatsappDocument(input: WhatsappDocInput): Promise<void> {
  if (!isAllowedFile(input.mimeType)) return;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('phone_number', input.phoneNumber)
    .single();

  if (!user) throw new Error(`No user found for phone ${input.phoneNumber}`);

  const storagePath = buildStoragePath(user.id, input.filename);
  await uploadToStorage('whatsapp-documents', storagePath, input.data, input.mimeType);

  await supabase.from('whatsapp_docs').insert({
    user_id: user.id,
    file_name: input.filename,
    mime_type: input.mimeType,
    storage_path: storagePath,
    message_id: input.messageId,
  });
}
