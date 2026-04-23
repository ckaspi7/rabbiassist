import React, { useState, useMemo } from 'react';
import PageTitle from '../components/shared/PageTitle';
import Calendar from '../components/events/Calendar';
import EventList from '../components/events/EventList';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useExpandedEvents } from '@/hooks/useExpandedEvents';
import AddEventModal from '@/components/events/AddEventModal';
import EditEventModal from '@/components/events/EditEventModal';
import EditOccurrenceModal from '@/components/events/EditOccurrenceModal';
import EventDayModal from '@/components/events/EventDayModal';
import RecurringEventChoiceModal from '@/components/events/RecurringEventChoiceModal';
import { isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { ExpandedOccurrence, parseOccurrenceId } from '@/lib/recurrence';

const Events = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditOccurrenceModal, setShowEditOccurrenceModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showRecurringChoiceModal, setShowRecurringChoiceModal] = useState(false);
  const [recurringAction, setRecurringAction] = useState<'edit' | 'delete'>('edit');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<ExpandedOccurrence | null>(null);
  const [dateForNewEvent, setDateForNewEvent] = useState<Date | null>(null);
  
  // Calculate date range for occurrence expansion (3 months window)
  const rangeStart = useMemo(() => subMonths(startOfMonth(selectedDate), 1), [selectedDate]);
  const rangeEnd = useMemo(() => addMonths(endOfMonth(selectedDate), 2), [selectedDate]);
  
  const { 
    masterEvents, 
    occurrences, 
    isLoading, 
    createEvent, 
    updateEvent, 
    deleteEvent 
  } = useExpandedEvents({ rangeStart, rangeEnd });
  
  const { updateOccurrence, deleteOccurrence } = useEvents();
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };
  
  const handleOccurrenceClick = (occurrence: ExpandedOccurrence) => {
    setSelectedOccurrence(occurrence);
    
    if (occurrence.is_recurring) {
      setRecurringAction('edit');
      setShowRecurringChoiceModal(true);
    } else {
      // Non-recurring event - edit directly
      const event = masterEvents.find(e => e.id === occurrence.series_id);
      if (event) {
        setSelectedEvent(event);
        setShowEditModal(true);
      }
    }
  };
  
  const handleEditSeries = () => {
    if (selectedOccurrence) {
      const event = masterEvents.find(e => e.id === selectedOccurrence.series_id);
      if (event) {
        setSelectedEvent(event);
        setShowEditModal(true);
      }
    }
  };
  
  const handleEditOccurrence = () => {
    if (selectedOccurrence) {
      setShowEditOccurrenceModal(true);
    }
  };
  
  const handleDeleteSeries = () => {
    if (selectedOccurrence) {
      deleteEvent.mutate(selectedOccurrence.series_id);
    }
  };
  
  const handleDeleteOccurrence = () => {
    if (selectedOccurrence) {
      const { seriesId, occurrenceStart } = parseOccurrenceId(selectedOccurrence.occurrence_id);
      if (occurrenceStart) {
        deleteOccurrence.mutate({
          series_id: seriesId,
          occurrence_start_iso: occurrenceStart,
        });
      }
    }
  };
  
  const handleEditEventFromList = (event: any) => {
    // Check if this is a recurring event
    if (event.recurrence_rule) {
      setSelectedEvent(event);
      setSelectedOccurrence(null);
      setShowEditModal(true);
    } else {
      setSelectedEvent(event);
      setShowEditModal(true);
    }
  };

  const handleCreateEvent = (eventData: any) => {
    createEvent.mutate(eventData);
    setShowAddModal(false);
    setDateForNewEvent(null);
  };

  const handleAddEventFromDay = () => {
    setDateForNewEvent(selectedDate);
    setShowDayModal(false);
    setShowAddModal(true);
  };

  const handleUpdateEvent = (id: string, updates: any) => {
    updateEvent.mutate({ id, ...updates });
  };
  
  const handleUpdateOccurrence = (overridePayload: any) => {
    if (selectedOccurrence) {
      const { seriesId, occurrenceStart } = parseOccurrenceId(selectedOccurrence.occurrence_id);
      if (occurrenceStart) {
        updateOccurrence.mutate({
          series_id: seriesId,
          occurrence_start_iso: occurrenceStart,
          override: overridePayload,
        });
      }
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent.mutate(id);
  };
  
  // Get occurrences for the selected day
  const selectedDayOccurrences = useMemo(() => {
    return occurrences.filter(occ => 
      isSameDay(new Date(occ.occurrence_start), selectedDate)
    );
  }, [occurrences, selectedDate]);
  
  // Get upcoming occurrences for the list (next 5)
  const upcomingOccurrences = useMemo(() => {
    const now = new Date();
    return occurrences
      .filter(occ => new Date(occ.occurrence_start) >= now)
      .slice(0, 5);
  }, [occurrences]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-8">
      <div className="flex justify-between items-center mb-8">
        <PageTitle title="Event Manager" />
        
        <Button 
          size="sm" 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          <Plus size={18} className="mr-2" /> Add New Event
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar 
            occurrences={occurrences}
            onDateClick={handleDateClick}
            onOccurrenceClick={handleOccurrenceClick}
            selectedDate={selectedDate}
          />
        </div>
        
        <div>
          <EventList 
            events={selectedDayOccurrences.length > 0 
              ? selectedDayOccurrences.map(occ => ({
                  id: occ.series_id,
                  title: occ.title,
                  event_datetime: occ.occurrence_start,
                  end_datetime: occ.occurrence_end,
                  location: occ.location,
                  description: occ.description,
                  type: occ.type,
                  user_id: '',
                  recurrence_rule: occ.recurrence_rule,
                  is_recurring: occ.is_recurring,
                  is_override: occ.is_override,
                  occurrence_id: occ.occurrence_id,
                } as any))
              : upcomingOccurrences.map(occ => ({
                  id: occ.series_id,
                  title: occ.title,
                  event_datetime: occ.occurrence_start,
                  end_datetime: occ.occurrence_end,
                  location: occ.location,
                  description: occ.description,
                  type: occ.type,
                  user_id: '',
                  recurrence_rule: occ.recurrence_rule,
                  is_recurring: occ.is_recurring,
                  is_override: occ.is_override,
                  occurrence_id: occ.occurrence_id,
                } as any))
            } 
            onEdit={handleEditEventFromList}
          />
        </div>
      </div>

      <AddEventModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) setDateForNewEvent(null);
        }}
        onSubmit={handleCreateEvent}
        preselectedDate={dateForNewEvent}
      />

      <EditEventModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        event={selectedEvent}
        onSubmit={handleUpdateEvent}
        onDelete={handleDeleteEvent}
      />
      
      <EditOccurrenceModal
        open={showEditOccurrenceModal}
        onOpenChange={setShowEditOccurrenceModal}
        occurrence={selectedOccurrence}
        onSubmit={handleUpdateOccurrence}
      />
      
      <RecurringEventChoiceModal
        open={showRecurringChoiceModal}
        onOpenChange={setShowRecurringChoiceModal}
        action={recurringAction}
        onChooseOccurrence={recurringAction === 'edit' ? handleEditOccurrence : handleDeleteOccurrence}
        onChooseSeries={recurringAction === 'edit' ? handleEditSeries : handleDeleteSeries}
      />

      <EventDayModal
        open={showDayModal}
        onOpenChange={setShowDayModal}
        date={selectedDate}
        events={selectedDayOccurrences.map(occ => ({
          id: occ.series_id,
          title: occ.title,
          event_datetime: occ.occurrence_start,
          end_datetime: occ.occurrence_end,
          location: occ.location,
          description: occ.description,
          type: occ.type,
          user_id: '',
          recurrence_rule: occ.recurrence_rule,
          is_recurring: occ.is_recurring,
          occurrence_id: occ.occurrence_id,
        } as any))}
        onAddEvent={handleAddEventFromDay}
        onEditEvent={(event) => {
          const occ = selectedDayOccurrences.find(o => 
            o.series_id === event.id && 
            o.occurrence_start === event.event_datetime
          );
          if (occ && occ.is_recurring) {
            setSelectedOccurrence(occ);
            setRecurringAction('edit');
            setShowDayModal(false);
            setShowRecurringChoiceModal(true);
          } else {
            setSelectedEvent(event);
            setShowDayModal(false);
            setShowEditModal(true);
          }
        }}
        onDeleteEvent={(id) => {
          const occ = selectedDayOccurrences.find(o => o.series_id === id);
          if (occ && occ.is_recurring) {
            setSelectedOccurrence(occ);
            setRecurringAction('delete');
            setShowDayModal(false);
            setShowRecurringChoiceModal(true);
          } else {
            deleteEvent.mutate(id);
            setShowDayModal(false);
          }
        }}
      />
    </div>
  );
};

export default Events;
