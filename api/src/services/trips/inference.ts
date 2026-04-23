import {
  getUserByEmail,
  getMatchingTrips,
  getTripItems,
  createTrip,
  createTripItem,
  updateTripItem,
  checkDuplicateReviewItem,
  flagForReview,
} from './crud.js';
import type { ExtractedTripItem } from '../ai/trip-extractor.js';
import type { TripItemType } from '../../db/types.js';

export type InferenceResult =
  | { action: 'created_trip'; tripId: string; tripItemId: string }
  | { action: 'inserted_item'; tripId: string; tripItemId: string }
  | { action: 'updated_item'; tripId: string; tripItemId: string }
  | { action: 'no_change'; tripId: string; tripItemId: string }
  | { action: 'flagged_for_review' }
  | { action: 'skipped' }
  | { action: 'error'; reason: string };

// Implements the 3-agent Trip Inference Agent logic in TypeScript.
// Agent 1: look up user + existing trips + trip items.
// Agent 2: decide create/insert/update/no_change.
// Agent 3: flag for review or skip (duplicate check).
export async function inferTrip(item: ExtractedTripItem): Promise<InferenceResult> {
  // Agent 1 — gather data
  const user = await getUserByEmail(item.user_id);
  if (!user) return { action: 'error', reason: `Unknown user email: ${item.user_id}` };

  const userId = user.id;
  const matchingTrips = await getMatchingTrips(userId, item.destination, item.start_date, item.end_date);
  const trip = matchingTrips[0] ?? null;
  const tripId = trip?.id ?? null;
  const existingItems = tripId ? await getTripItems(userId, tripId) : [];
  const type = item.type as TripItemType;

  // Agent 2 — decide operation
  if (!tripId) {
    // No matching trip — create trip + item
    if (!item.destination || !item.start_date) {
      // Flag for review instead — missing required fields
      const isDupe = await checkDuplicateReviewItem(userId, item.email_id, type);
      if (isDupe) return { action: 'skipped' };
      await flagForReview({ userId, type, rawEmailId: item.email_id });
      return { action: 'flagged_for_review' };
    }

    const newTrip = await createTrip({
      userId,
      destination: item.destination,
      startDate: item.start_date,
      endDate: item.end_date,
      inferredFrom: type,
      confidenceScore: item.confidence_score ?? 0,
      sourceEmailId: item.email_id,
    });
    const newItem = await createTripItem({
      tripId: newTrip.id,
      userId,
      type,
      status: item.status ?? 'incomplete',
      documentUrl: item.document_url || undefined,
      startDate: item.start_date,
      endDate: item.end_date,
      destination: item.destination,
      rawEmailId: item.email_id,
    });
    return { action: 'created_trip', tripId: newTrip.id, tripItemId: newItem.id };
  }

  // Trip exists — check existing items
  const existingItem = existingItems.find((i) => i.type === type);

  if (!existingItem) {
    const newItem = await createTripItem({
      tripId,
      userId,
      type,
      status: item.status ?? 'incomplete',
      documentUrl: item.document_url || undefined,
      startDate: item.start_date,
      endDate: item.end_date,
      destination: item.destination,
      rawEmailId: item.email_id,
    });
    return { action: 'inserted_item', tripId, tripItemId: newItem.id };
  }

  if (existingItem.status !== item.status) {
    await updateTripItem(existingItem.id, { status: item.status as never });
    return { action: 'updated_item', tripId, tripItemId: existingItem.id };
  }

  return { action: 'no_change', tripId, tripItemId: existingItem.id };
}
