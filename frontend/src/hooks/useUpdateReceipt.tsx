import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useToast } from './use-toast';
import { receiptSchema } from '../lib/validation';
import type { Receipt } from './useReceipts';

export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Receipt> }) => {
      // Validate input before updating
      const validatedUpdates = receiptSchema.partial().parse(updates);
      
      const { data, error } = await supabase
        .from('receipts')
        .update(validatedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast({ title: 'Success', description: 'Receipt updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};
