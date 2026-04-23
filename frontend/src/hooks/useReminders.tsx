import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './use-toast';
import { reminderSchema } from '../lib/validation';

export interface DatabaseReminder {
  id: string;
  title: string;
  description?: string | null;
  due_date: string | null;
  is_completed: boolean | null;
  source: string;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  metadata: any;
  trip_id: string | null;
  trip_item_id: string | null;
  source_id: string | null;
  reminder_type: string | null;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<DatabaseReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReminders = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReminders(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error loading reminders',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReminder = async (reminder: Omit<DatabaseReminder, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return;

    try {
      // Validate input before sending to database (only validating user-controlled fields)
      reminderSchema.parse({
        title: reminder.title,
        description: reminder.description,
        due_date: reminder.due_date,
        source: reminder.source,
        reminder_type: reminder.reminder_type,
      });

      const { data, error } = await supabase
        .from('reminders')
        .insert([{ ...reminder, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [data, ...prev]);
      toast({
        title: 'Reminder created',
        description: 'Your reminder has been created successfully.',
      });
      return data;
    } catch (err: any) {
      toast({
        title: 'Error creating reminder',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateReminder = async (id: string, updates: Partial<DatabaseReminder>) => {
    try {
      // Validate input before updating (only validate fields that are being updated)
      if (Object.keys(updates).some(key => ['title', 'description', 'due_date', 'source', 'reminder_type'].includes(key))) {
        reminderSchema.partial().parse({
          title: updates.title,
          description: updates.description,
          due_date: updates.due_date,
          source: updates.source,
          reminder_type: updates.reminder_type,
        });
      }

      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(reminder => 
        reminder.id === id ? { ...reminder, ...data } : reminder
      ));

      return data;
    } catch (err: any) {
      toast({
        title: 'Error updating reminder',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => reminder.id !== id));
      toast({
        title: 'Reminder deleted',
        description: 'The reminder has been deleted successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting reminder',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteMultipleReminders = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setReminders(prev => prev.filter(reminder => !ids.includes(reminder.id)));
      toast({
        title: 'Reminders deleted',
        description: `${ids.length} reminders have been deleted successfully.`,
      });
    } catch (err: any) {
      toast({
        title: 'Error deleting reminders',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const toggleComplete = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    try {
      await updateReminder(id, { 
        is_completed: !reminder.is_completed 
      });

      toast({
        title: reminder.is_completed ? 'Reminder marked as incomplete' : 'Reminder completed',
        description: reminder.is_completed 
          ? 'The reminder has been marked as incomplete.' 
          : 'The reminder has been completed.',
      });
    } catch (err) {
      // Error already handled in updateReminder
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  return {
    reminders,
    isLoading,
    error,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    deleteMultipleReminders,
    toggleComplete,
  };
};