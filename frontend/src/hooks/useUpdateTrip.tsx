import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { toast } from './use-toast';
import { tripSchema } from '../lib/validation';
import type { Trip } from './useTrips';

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Trip> }) => {
      // Validate input before updating
      const validatedUpdates = tripSchema.partial().parse(updates);
      
      const { data, error } = await supabase
        .from('trips')
        .update(validatedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({ title: 'Success', description: 'Trip updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};
