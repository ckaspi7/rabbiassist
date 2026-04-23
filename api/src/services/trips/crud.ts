import { supabase } from '../../db/client.js';
import type { Trip, TripItem, TripItemType, TripItemStatus } from '../../db/types.js';

export async function getUserByEmail(email: string): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .single();
  return data;
}

export async function getMatchingTrips(
  userId: string,
  destination: string,
  startDate: string,
  endDate: string,
): Promise<Trip[]> {
  // Allow ±2 day overlap on dates
  const { data } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .lte('start_date', endDate)
    .gte('end_date', startDate);
  if (!data) return [];
  // Fuzzy destination match client-side (destination can be "NYC" vs "New York")
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
  return data.filter(
    (t) =>
      norm(t.destination).includes(norm(destination)) ||
      norm(destination).includes(norm(t.destination)),
  );
}

export async function getTripItems(userId: string, tripId: string): Promise<TripItem[]> {
  const { data } = await supabase
    .from('trip_items')
    .select('*')
    .eq('user_id', userId)
    .eq('trip_id', tripId);
  return data ?? [];
}

export async function createTrip(params: {
  userId: string;
  destination: string;
  startDate: string;
  endDate: string;
  inferredFrom: TripItemType;
  confidenceScore: number;
  sourceEmailId: string;
}): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: params.userId,
      title: `${params.destination} on ${params.startDate}`,
      destination: params.destination,
      start_date: params.startDate,
      end_date: params.endDate,
      inferred_from: params.inferredFrom,
      confidence_score: params.confidenceScore,
      source_email_id: params.sourceEmailId,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create trip: ${error?.message}`);
  return data;
}

export async function createTripItem(params: {
  tripId: string;
  userId: string;
  type: TripItemType;
  status: TripItemStatus | string;
  documentUrl?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
  rawEmailId?: string;
}): Promise<TripItem> {
  const { data, error } = await supabase
    .from('trip_items')
    .insert({
      trip_id: params.tripId,
      user_id: params.userId,
      type: params.type,
      status: params.status,
      document_url: params.documentUrl ?? null,
      start_date: params.startDate ?? null,
      end_date: params.endDate ?? null,
      destination: params.destination ?? null,
      raw_email_id: params.rawEmailId ?? null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create trip item: ${error?.message}`);
  return data;
}

export async function updateTripItem(
  tripItemId: string,
  updates: Partial<Pick<TripItem, 'status' | 'document_url' | 'start_date' | 'end_date'>>,
): Promise<void> {
  const { error } = await supabase
    .from('trip_items')
    .update(updates)
    .eq('id', tripItemId);
  if (error) throw new Error(`Failed to update trip item: ${error.message}`);
}

export async function checkDuplicateReviewItem(
  userId: string,
  rawEmailId: string,
  type: TripItemType,
): Promise<boolean> {
  const { data } = await supabase
    .from('trip_items_to_review')
    .select('id')
    .eq('user_id', userId)
    .eq('raw_email_id', rawEmailId)
    .eq('type', type);
  return (data?.length ?? 0) > 0;
}

export async function flagForReview(params: {
  userId: string;
  type: TripItemType;
  rawEmailId: string;
  fileName?: string;
  mimeType?: string;
  storagePath?: string;
}): Promise<void> {
  await supabase.from('trip_items_to_review').insert({
    user_id: params.userId,
    type: params.type,
    raw_email_id: params.rawEmailId,
    file_name: params.fileName ?? null,
    mime_type: params.mimeType ?? null,
    storage_path: params.storagePath ?? null,
    original_name: params.fileName ?? null,
    created_at: new Date().toISOString(),
  });
}
