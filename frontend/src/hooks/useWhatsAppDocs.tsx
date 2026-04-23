
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

export interface WhatsAppDoc {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string | null;
  mime_type: string | null;
  status: string | null;
  message_id: string | null;
  created_at: string | null;
}

export const useWhatsAppDocs = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['whatsapp-docs', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('whatsapp_docs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as WhatsAppDoc[];
    },
    enabled: !!user?.id
  });
};

export const useDeleteWhatsAppDoc = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from('whatsapp_docs')
        .delete()
        .eq('id', docId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-docs'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
};
