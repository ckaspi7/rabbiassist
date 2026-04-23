
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { receiptSchema, sanitizeFilename } from '../lib/validation';

export interface Receipt {
  id: string;
  user_id: string;
  vendor: string | null;
  total_amount: string | null;
  received_date: string | null;
  expense_date: string | null;
  category: string | null;
  details: string | null;
  file_name: string;
  mime_type: string | null;
  storage_path: string | null;
  document_url: string | null;
  created_at: string;
  status: 'New' | 'Reviewed' | 'Exported';
}

export const useReceipts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['receipts', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Receipt[];
    },
    enabled: !!user?.id
  });
};

export const useUpdateReceiptStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ receiptId, status }: { receiptId: string, status: 'New' | 'Reviewed' | 'Exported' }) => {
      const { error } = await supabase
        .from('receipts')
        .update({ status })
        .eq('id', receiptId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};

export const useUploadReceipt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Sanitize filename to prevent path traversal attacks
      const sanitizedName = sanitizeFilename(file.name);
      const fileName = `${Date.now()}_${sanitizedName}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Insert record
      const { error: insertError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          file_name: fileName,
          mime_type: file.type,
          storage_path: filePath,
          vendor: null,
          total_amount: null,
          category: null,
          details: null,
          status: 'New'
        });
      
      if (insertError) throw insertError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      toast({ title: 'Success', description: 'Receipt uploaded successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};

export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (receiptId: string) => {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};
