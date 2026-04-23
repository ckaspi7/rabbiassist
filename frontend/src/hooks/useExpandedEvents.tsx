import { useMemo } from 'react';
import { useEvents, Event } from './useEvents';
import { expandRecurringEvents, ExpandedOccurrence, MasterEvent, RecurrenceOverrides } from '@/lib/recurrence';
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';

interface UseExpandedEventsOptions {
  rangeStart?: Date;
  rangeEnd?: Date;
}

// Convert Event to MasterEvent format
function eventToMaster(event: Event): MasterEvent {
  return {
    id: event.id,
    title: event.title,
    event_datetime: event.event_datetime,
    end_datetime: event.end_datetime,
    location: event.location,
    description: event.description,
    type: event.type,
    user_id: event.user_id,
    recurrence_rule: event.recurrence_rule,
    recurrence_exceptions: (event as any).recurrence_exceptions || null,
    recurrence_overrides: (event as any).recurrence_overrides as RecurrenceOverrides || null,
    all_day: event.all_day,
    timezone: event.timezone,
    google_event_id: (event as any).google_event_id,
    sync_status: event.sync_status,
  };
}

export function useExpandedEvents(options: UseExpandedEventsOptions = {}) {
  const {
    rangeStart = subMonths(startOfMonth(new Date()), 1),
    rangeEnd = addMonths(endOfMonth(new Date()), 2),
  } = options;

  const { events, isLoading, error, createEvent, updateEvent, deleteEvent } = useEvents();

  // Expand recurring events
  const expandedOccurrences = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    const masterEvents = events.map(eventToMaster);
    return expandRecurringEvents(masterEvents, rangeStart, rangeEnd);
  }, [events, rangeStart, rangeEnd]);

  // Get master events (non-expanded, for series operations)
  const masterEvents = useMemo(() => events, [events]);

  return {
    // Expanded occurrences for calendar display
    occurrences: expandedOccurrences,
    // Original master events
    masterEvents,
    isLoading,
    error,
    // CRUD operations from useEvents
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

export type { ExpandedOccurrence };
