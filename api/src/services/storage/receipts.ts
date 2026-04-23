import { supabase } from '../../db/client.js';
import { uploadToStorage, buildStoragePath, isAllowedFile } from './upload.js';
import { extractReceipt } from '../ai/receipt-extractor.js';
import type { EmailMessage } from '../gmail/client.js';

export async function processReceiptEmail(
  email: EmailMessage,
  userId: string,
): Promise<void> {
  const pdfAttachments = email.attachments.filter((a) => isAllowedFile(a.mimeType));

  const attachmentTexts = email.attachments.map((a) => a.filename);
  const extracted = await extractReceipt(
    email.body,
    attachmentTexts,
    email.id,
    email.id,
    userId,
  );

  for (const attachment of pdfAttachments) {
    const storagePath = buildStoragePath(userId, attachment.filename);
    const { publicUrl } = await uploadToStorage(
      'receipts',
      storagePath,
      attachment.data,
      attachment.mimeType,
    );

    await supabase.from('receipts').insert({
      user_id: userId,
      file_name: attachment.filename,
      mime_type: attachment.mimeType,
      storage_path: storagePath,
      vendor: extracted.vendor,
      total_amount: extracted.total_amount ? parseFloat(extracted.total_amount.replace(/[^0-9.]/g, '')) : null,
      received_date: extracted.received_date || null,
      expense_date: extracted.expense_date || null,
      category: extracted.category,
      details: extracted.details,
      document_url: publicUrl,
      email_id: email.id,
    });
  }
}
