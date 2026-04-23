import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Plus, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { Event } from '@/hooks/useEvents';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
}

const EventDayModal = ({ 
  open, 
  onOpenChange, 
  date, 
  events, 
  onAddEvent,
  onEditEvent,
  onDeleteEvent 
}: EventDayModalProps) => {
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      onDeleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              onClick={onAddEvent}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200"
            >
              <Plus size={18} className="mr-2" /> Add Event on This Day
            </Button>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg">No events scheduled for this day</p>
                  <p className="text-sm mt-2">Click the button above to add an event</p>
                </div>
              ) : (
                events.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                          <span className={`
                            text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap
                            ${event.type === 'routine' 
                              ? 'bg-primary/20 text-primary' 
                              : event.type === 'special' 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'}
                          `}>
                            {event.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={16} />
                          <span className="text-sm">
                            {format(new Date(event.event_datetime), 'h:mm a')}
                            {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'h:mm a')}`}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={16} />
                            <span className="text-sm">{event.location}</span>
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditEvent(event)}
                        className="flex-1 border-border hover:bg-accent"
                      >
                        <Edit size={16} className="mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(event)}
                        className="flex-1"
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete "{eventToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDayModal;
