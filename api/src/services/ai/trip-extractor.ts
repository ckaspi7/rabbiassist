import { chatCompleteJson } from './openai.js';
import type { TripItemType, TripItemStatus } from '../../db/types.js';

export interface ExtractedTripItem {
  destination: string;
  start_date: string;
  end_date: string;
  type: TripItemType;
  details: string;
  confidence_score: number;
  status: TripItemStatus | 'incomplete' | 'pending' | 'rescheduled' | 'not needed';
  document_url: string;
  email_id: string;
  user_id: string;
}

const FLIGHT_SYSTEM_PROMPT = `You are a travel information extraction expert. Your task is to analyze an email about travel (e.g., flight, hotel, car rental, travel insurance) and extract the following information in a structured JSON format:

Extract and return the following fields:

- destination: string — the city and country this travel item relates to (e.g., "Paris, France").
- start_date: string (YYYY-MM-DD) — the earliest relevant date (e.g., departure, check-in, pickup).
- end_date: string (YYYY-MM-DD) — the latest relevant date (e.g., return, check-out, drop-off).
- type: string — type of travel info as one of the following: "flight", "hotel", "car", "travel_insurance", or "other".
- details: string — brief summary of key information (e.g., "Round-trip flight from Toronto to Paris on Air Canada").
- confidence_score: number — a value from 0 to 1 indicating your confidence in the extracted information.
- status: string — the completion status of the trip item if determinable, one of: "booked", "pending", "rescheduled", "cancelled", "not needed", or "incomplete" (default if indeterminable).
- document_url: string — any confirmation, ticket, or receipt URL if found (else leave blank).
- email_id: string — pass through the email_id value you receive.
- user_id: string — pass through the user_id value you receive.

Return JSON only.`;

const NON_FLIGHT_SYSTEM_PROMPT = `You are a travel information extraction expert. Your task is to analyze an email about travel (e.g., hotel, car rental, travel insurance) and extract the following information in a structured JSON format:

Extract and return the following fields:

- destination: string — the city and country this travel item relates to (e.g., "Paris, France").
- start_date: string (YYYY-MM-DD) — the earliest relevant date (e.g., departure, check-in, pickup).
- end_date: string (YYYY-MM-DD) — the latest relevant date (e.g., return, check-out, drop-off).
- type: string — type of travel info as one of the following: "hotel", "car", "travel_insurance", or "other".
- details: string — brief summary of key information (e.g., "Car rental from Hertz in Istanbul, Turkey").
- confidence_score: number — a value from 0 to 1 indicating your confidence in the extracted information.
- status: string — the completion status of the trip item if determinable, one of: "incomplete", "booked", "pending", "rescheduled", "cancelled", or "not needed" (if indeterminable default to "incomplete").
- document_url: string — any confirmation, ticket, or receipt URL if found (else leave blank).
- email_id: string — pass through the email_id value you receive.
- user_id: string — pass through the user_id value you receive.

Return JSON only.`;

export async function extractTripItem(
  emailBody: string,
  attachmentTexts: string[],
  emailId: string,
  userId: string,
  subcategory: string,
): Promise<ExtractedTripItem> {
  const isFlightContext = subcategory === 'Flights';
  const systemPrompt = isFlightContext ? FLIGHT_SYSTEM_PROMPT : NON_FLIGHT_SYSTEM_PROMPT;

  const attachments = attachmentTexts
    .map((t, i) => `Attachment ${i}:\n${t.substring(0, 3000)}`)
    .join('\n\n');

  const userContent = `Email body:\n${emailBody}${attachments ? `\n\nAttachments:\n${attachments}` : ''}\n\nemail_id: ${emailId}\nuser_id: ${userId}`;

  return chatCompleteJson<ExtractedTripItem>('gpt-4o-mini', systemPrompt, userContent);
}
