import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { RecurrenceOverrides, RecurrenceOverride } from '@/lib/recurrence';

export interface Event {
  id: string;
  title: string | null;
  event_datetime: string;
  end_datetime?: string | null;
  location?: string | null;
  description?: string | null;
  type: string;
  whatsapp_group_id?: string | null;
  user_id: string;
  recurrence_rule?: string | null;
  recurrence_exceptions?: string[] | null;
  recurrence_overrides?: RecurrenceOverrides | null;
  all_day?: boolean | null;
  timezone?: string | null;
  sync_source?: string;
  sync_status?: string;
  deleted?: boolean;
  deleted_at?: string | null;
  local_modified_at?: string | null;
  created_at?: string | null;
  google_event_id?: string | null;
}

export interface CreateEventInput {
  title?: string | null;
  event_datetime: string;
  end_datetime?: string | null;
  location?: string | null;
  description?: string | null;
  type?: string;
  whatsapp_group_id?: string | null;
  recurrence_rule?: string | null;
  all_day?: boolean;
  timezone?: string;
}

export interface UpdateEventInput {
  id: string;
  title?: string | null;
  event_datetime?: string;
  end_datetime?: string | null;
  location?: string | null;
  description?: string | null;
  type?: string;
  recurrence_rule?: string | null;
  all_day?: boolean;
  timezone?: string;
}

export interface UpdateOccurrenceInput {
  series_id: string;
  occurrence_start_iso: string;
  override: RecurrenceOverride;
}

export interface DeleteOccurrenceInput {
  series_id: string;
  occurrence_start_iso: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch only non-deleted events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('deleted', false)
        .order('event_datetime', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user?.id,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['events', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const createEvent = useMutation({
    mutationFn: async (newEvent: CreateEventInput) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Validate required field
      if (!newEvent.event_datetime) {
        throw new Error('event_datetime is required');
      }

      // Validate end_datetime >= event_datetime if provided
      if (newEvent.end_datetime && new Date(newEvent.end_datetime) < new Date(newEvent.event_datetime)) {
        throw new Error('end_datetime must be greater than or equal to event_datetime');
      }

      // Build the event payload following canonical rules
      const eventPayload = {
        title: newEvent.title || null,
        description: newEvent.description || null,
        event_datetime: newEvent.event_datetime,
        end_datetime: newEvent.end_datetime || null,
        type: newEvent.type || 'routine',
        location: newEvent.location || null,
        recurrence_rule: newEvent.recurrence_rule || null,
        all_day: newEvent.all_day || false,
        timezone: newEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        whatsapp_group_id: newEvent.whatsapp_group_id || null,
        user_id: user.id,
        sync_source: 'web',
        sync_status: 'pending',
        deleted: false,
        sync_attempts: 0,
      };

      const { data, error } = await supabase
        .from('events')
        .insert([eventPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateEventInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Validate end_datetime >= event_datetime if both are provided
      if (updates.end_datetime && updates.event_datetime) {
        if (new Date(updates.end_datetime) < new Date(updates.event_datetime)) {
          throw new Error('end_datetime must be greater than or equal to event_datetime');
        }
      }

      // Only allow specific fields to be updated from UI
      const allowedUpdates: Partial<Event> = {};
      if (updates.title !== undefined) allowedUpdates.title = updates.title;
      if (updates.description !== undefined) allowedUpdates.description = updates.description;
      if (updates.event_datetime !== undefined) allowedUpdates.event_datetime = updates.event_datetime;
      if (updates.end_datetime !== undefined) allowedUpdates.end_datetime = updates.end_datetime;
      if (updates.type !== undefined) allowedUpdates.type = updates.type;
      if (updates.all_day !== undefined) allowedUpdates.all_day = updates.all_day;
      if (updates.timezone !== undefined) allowedUpdates.timezone = updates.timezone;
      if (updates.recurrence_rule !== undefined) allowedUpdates.recurrence_rule = updates.recurrence_rule;
      if (updates.location !== undefined) allowedUpdates.location = updates.location;

      const updatePayload = {
        ...allowedUpdates,
        sync_source: 'web',
        sync_status: 'pending',
      };

      const { data, error } = await supabase
        .from('events')
        .update(updatePayload as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Event not found or access denied');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update a single occurrence of a recurring event
  const updateOccurrence = useMutation({
    mutationFn: async ({ series_id, occurrence_start_iso, override }: UpdateOccurrenceInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First fetch the current event to get existing overrides
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('recurrence_overrides')
        .eq('id', series_id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentEvent) throw new Error('Event not found');

      // Merge new override with existing overrides
      const existingOverrides = (currentEvent.recurrence_overrides as RecurrenceOverrides) || {};
      const updatedOverrides: RecurrenceOverrides = {
        ...existingOverrides,
        [occurrence_start_iso]: {
          ...existingOverrides[occurrence_start_iso],
          ...override,
        },
      };

      // Update the event with new overrides
      const { data, error } = await supabase
        .from('events')
        .update({
          recurrence_overrides: updatedOverrides as unknown,
          sync_source: 'web',
          sync_status: 'pending',
        } as any)
        .eq('id', series_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast({
        title: 'Success',
        description: 'Occurrence updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update occurrence: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete a single occurrence of a recurring event
  const deleteOccurrence = useMutation({
    mutationFn: async ({ series_id, occurrence_start_iso }: DeleteOccurrenceInput) => {
      if (!user?.id) throw new Error('User not authenticated');

      // First fetch the current event
      const { data: currentEvent, error: fetchError } = await supabase
        .from('events')
        .select('recurrence_exceptions, recurrence_overrides')
        .eq('id', series_id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!currentEvent) throw new Error('Event not found');

      // Check if there are existing overrides for this occurrence
      const existingOverrides = (currentEvent.recurrence_overrides as RecurrenceOverrides) || {};
      const hasOtherOverrides = existingOverrides[occurrence_start_iso] && 
        Object.keys(existingOverrides[occurrence_start_iso]).some(k => k !== 'deleted');

      let updatePayload: Record<string, unknown> = {
        sync_source: 'web',
        sync_status: 'pending',
      };

      if (hasOtherOverrides) {
        // If there are other overrides, mark as deleted in overrides
        updatePayload.recurrence_overrides = {
          ...existingOverrides,
          [occurrence_start_iso]: {
            ...existingOverrides[occurrence_start_iso],
            deleted: true,
          },
        } as unknown;
      } else {
        // Otherwise, use recurrence_exceptions (simpler)
        const existingExceptions = (currentEvent.recurrence_exceptions as string[]) || [];
        updatePayload.recurrence_exceptions = [...existingExceptions, occurrence_start_iso];
        
        // Remove any override entry for this occurrence
        if (existingOverrides[occurrence_start_iso]) {
          const { [occurrence_start_iso]: _, ...remainingOverrides } = existingOverrides;
          updatePayload.recurrence_overrides = remainingOverrides as unknown;
        }
      }

      const { data, error } = await supabase
        .from('events')
        .update(updatePayload as any)
        .eq('id', series_id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast({
        title: 'Success',
        description: 'Occurrence deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete occurrence: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Soft delete - sets deleted=true instead of removing the row
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .update({
          deleted: true,
          deleted_at: new Date().toISOString(),
          sync_status: 'pending',
          sync_source: 'web',
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Event not found or access denied');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', user?.id] });
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete event: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    updateOccurrence,
    deleteOccurrence,
    deleteEvent,
  };
};
