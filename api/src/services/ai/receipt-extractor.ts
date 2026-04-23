import { chatCompleteJson } from './openai.js';

export interface ExtractedReceipt {
  message_id: string;
  vendor: string;
  total_amount: string;
  received_date: string;
  expense_date: string;
  category: 'home' | 'office' | 'donation' | 'utilities' | 'education' | 'medical' | 'other';
  details: string;
  confidence_score: number;
  document_url: string;
  email_id: string;
  user_id: string;
}

const SYSTEM_PROMPT = `You are a receipt and invoice information extraction expert. Your task is to analyze an email containing a receipt or invoice and extract the following information in a structured JSON format.

Extract and return the following fields:

- message_id: string - a unique alphanumerical message id from this receipt's source (you may receive this as input).
- vendor: string — the company or individual associated with the receipt (e.g., "Amazon", "Home Depot", "Rabbi Moshe Cohen").
- total_amount: string — the total amount paid. Always format with the currency symbol before the number (e.g., "$75.99", "€120.00", "₪250").
- received_date: string (YYYY-MM-DD) — the date the receipt or invoice was received.
- expense_date: string (YYYY-MM-DD) — the actual date the expense or transaction occurred. If unclear, use the received_date.
- category: string — one of: "home", "office", "donation", "utilities", "education", "medical", "other".
- details: string — brief summary of what the receipt is for.
- confidence_score: number — a value between 0 and 1 indicating confidence.
- document_url: string — a link to any attached invoice or receipt file if available, else leave blank.
- email_id: string — pass through the email_id value you receive.
- user_id: string — pass through the user_id value you receive.

Return JSON only.`;

export async function extractReceipt(
  emailBody: string,
  attachmentTexts: string[],
  emailId: string,
  messageId: string,
  userId: string,
): Promise<ExtractedReceipt> {
  const attachments = attachmentTexts
    .map((t, i) => `Attachment ${i}:\n${t.substring(0, 3000)}`)
    .join('\n\n');

  const userContent = `Email body:\n${emailBody}${attachments ? `\n\nAttachments:\n${attachments}` : ''}\n\nmessage_id: ${messageId}\nemail_id: ${emailId}\nuser_id: ${userId}`;

  return chatCompleteJson<ExtractedReceipt>('gpt-4o-mini', SYSTEM_PROMPT, userContent);
}
