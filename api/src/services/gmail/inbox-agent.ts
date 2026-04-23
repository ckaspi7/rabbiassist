import { supabase } from '../../db/client.js';
import { listUnreadMessages, getMessage, addLabel, markRead } from './client.js';
import { classifyEmail } from '../ai/email-classifier.js';
import { extractTripItem } from '../ai/trip-extractor.js';
import { inferTrip } from '../trips/inference.js';
import { processReceiptEmail } from '../storage/receipts.js';
import { processTripDocuments } from '../storage/trip-docs.js';
import type { TripItemType } from '../../db/types.js';
import type { EmailMessage } from './client.js';

// Gmail label IDs — these must match the labels in the target Gmail account.
// Run the "Gmail Label Creation" utility once to create them, then update these IDs.
const LABEL_MAP: Record<string, string> = {
  'Trips': 'Label_Trips',
  'Trips/Flights': 'Label_Trips_Flights',
  'Trips/Hotels': 'Label_Trips_Hotels',
  'Trips/Car Rentals': 'Label_Trips_Car',
  'Trips/Travel Insurance': 'Label_Trips_Insurance',
  'Trips/Other': 'Label_Trips_Other',
  'Invoices & Receipts': 'Label_Receipts',
  'Rabbinate': 'Label_Rabbinate',
  'Learning Material': 'Label_Learning',
  'Other': 'Label_Other',
};

const SUBCATEGORY_TO_TRIP_TYPE: Record<string, TripItemType> = {
  Flights: 'flight',
  Hotels: 'hotel',
  'Car Rentals': 'car',
  'Travel Insurance': 'travel_insurance',
  Other: 'other',
};

// Called by the gmail-inbox-poll job for a single user.
export async function processInbox(userId: string, userEmail: string, calendarId: string): Promise<void> {
  const messageIds = await listUnreadMessages(userId);

  for (const msgId of messageIds) {
    try {
      await processMessage(userId, userEmail, calendarId, msgId);
    } catch (err) {
      console.error(`Failed to process message ${msgId}:`, err);
    }
  }
}

async function processMessage(
  userId: string,
  userEmail: string,
  _calendarId: string,
  messageId: string,
): Promise<void> {
  const email = await getMessage(userId, messageId);
  const attachmentTexts = email.attachments.map((a) => a.filename);

  const classification = await classifyEmail(
    email.from,
    email.subject,
    email.body,
    attachmentTexts,
  );

  if (classification.category === 'Trips' && classification.subcategory) {
    await handleTripsEmail(email, userId, userEmail, classification.subcategory);
  } else if (classification.category === 'Invoices & Receipts') {
    await processReceiptEmail(email, userId);
  }

  // Apply Gmail label
  const labelKey =
    classification.category === 'Trips' && classification.subcategory
      ? `Trips/${classification.subcategory}`
      : classification.category;
  const labelId = LABEL_MAP[labelKey];
  if (labelId) {
    await addLabel(userId, messageId, labelId);
  }

  await markRead(userId, messageId);
}

async function handleTripsEmail(
  email: EmailMessage,
  userId: string,
  userEmail: string,
  subcategory: string,
): Promise<void> {
  const attachmentTexts = email.attachments.map((a) => a.filename);
  const extracted = await extractTripItem(
    email.body,
    attachmentTexts,
    email.id,
    userEmail,
    subcategory,
  );

  const result = await inferTrip(extracted);

  // Upload trip documents if we got a trip/item ID
  if ('tripId' in result && result.tripId && email.attachments.length > 0) {
    const type = SUBCATEGORY_TO_TRIP_TYPE[subcategory] ?? 'other';
    await processTripDocuments({
      attachments: email.attachments,
      tripId: result.tripId,
      tripItemId: 'tripItemId' in result ? result.tripItemId : null,
      type,
      userId,
      rawEmailId: email.id,
    });
  }

  // Record processed email to avoid reprocessing (table may not exist yet)
  try {
    await supabase.from('processed_emails' as never).upsert({ email_id: email.id, user_id: userId });
  } catch { /* ignore */ }
}
