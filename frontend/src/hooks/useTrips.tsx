
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../hooks/use-toast';
import { tripSchema } from '../lib/validation';

// Define Trip type that matches Supabase schema
export interface Trip {
  id: string;
  title: string;
  destination: string | null;
  start_date: string;
  end_date: string;
  user_id: string;
}

// Define TripItem type that matches Supabase schema
export interface TripItem {
  id: string;
  trip_id: string;
  type: string;
  status: string;
  document_url: string | null;
  destination: string | null;
}

export interface TripItemToReview {
  id: string;
  type: string;
  status: string;
  destination: string | null;
  user_id: string;
  reason: string | null;
  created_at: string;
  raw_email_id: string | null;
  start_date: string | null;
  end_date: string | null;
  file_name: string | null;
  storage_path: string | null;
  mime_type: string | null;
  original_name: string | null;
}

// Hook for fetching user trips
export const useTrips = () => {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        throw error;
      }
      
      return data as Trip[];
    }
  });
};

// Hook for fetching trip items by trip ID
export const useTripItems = (tripId?: string) => {
  return useQuery({
    queryKey: ['trip-items', tripId],
    queryFn: async () => {
      if (!tripId) return [];
      
      const { data, error } = await supabase
        .from('trip_items')
        .select('*')
        .eq('trip_id', tripId);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        throw error;
      }
      
      return data as TripItem[];
    },
    enabled: !!tripId
  });
};

// Hook for fetching all trip items
export const useAllTripItems = () => {
  return useQuery({
    queryKey: ['all-trip-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_items')
        .select('*');
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        throw error;
      }
      
      return data as TripItem[];
    }
  });
};

// Hook for fetching trip items to review
export const useTripItemsToReview = () => {
  return useQuery({
    queryKey: ['trip-items-to-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trip_items_to_review')
        .select('*');
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        throw error;
      }
      
      return data as TripItemToReview[];
    }
  });
};

// Hook for updating a trip item status
export const useUpdateTripItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from('trip_items')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-trip-items'] });
      queryClient.invalidateQueries({ queryKey: ['trip-items'] });
      toast({ title: 'Success', description: 'Trip item updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};

// Hook for assigning a review item to a trip
export const useAssignReviewItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reviewItemId,
      tripId,
      type,
      status,
      documentUrl,
      destination 
    }: { 
      reviewItemId: string,
      tripId: string,
      type: string,
      status: string,
      documentUrl: string | null,
      destination: string | null
    }) => {
      // First, get the review item details and trip details
      const { data: reviewItem, error: reviewError } = await supabase
        .from('trip_items_to_review')
        .select('*')
        .eq('id', reviewItemId)
        .single();
      
      if (reviewError) throw reviewError;
      
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('start_date, end_date, destination, user_id')
        .eq('id', tripId)
        .single();
      
      if (tripError) throw tripError;
      
      // Begin a transaction
      const { error: deleteError } = await supabase
        .from('trip_items_to_review')
        .delete()
        .eq('id', reviewItemId);
      
      if (deleteError) throw deleteError;
      
      // Add to trip_items with all required fields
      const { error: insertError } = await supabase
        .from('trip_items')
        .insert({
          trip_id: tripId,
          type,
          status,
          document_url: documentUrl,
          destination: trip.destination || destination,
          start_date: trip.start_date,
          end_date: trip.end_date,
          user_id: reviewItem.user_id,
          raw_email_id: reviewItem.raw_email_id
        });
      
      if (insertError) throw insertError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-items-to-review'] });
      queryClient.invalidateQueries({ queryKey: ['all-trip-items'] });
      queryClient.invalidateQueries({ queryKey: ['trip-items'] });
      toast({ title: 'Success', description: 'Item assigned to trip successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};

// Hook for deleting a review item
export const useDeleteReviewItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trip_items_to_review')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip-items-to-review'] });
      toast({ title: 'Success', description: 'Item deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};

// Hook for deleting a trip
export const useDeleteTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tripId: string) => {
      // First delete all trip items
      const { error: itemsError } = await supabase
        .from('trip_items')
        .delete()
        .eq('trip_id', tripId);
      
      if (itemsError) throw itemsError;
      
      // Then delete the trip
      const { error: tripError } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);
      
      if (tripError) throw tripError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['all-trip-items'] });
      toast({ title: 'Success', description: 'Trip deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};
