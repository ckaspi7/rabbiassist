
import React from 'react';
import { format } from 'date-fns';
import { Edit2, MapPin, MessageCircle } from 'lucide-react';
import { Event } from '@/hooks/useEvents';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
}

const EventList = ({ events, onEdit }: EventListProps) => {
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.event_datetime);
    const dateB = new Date(b.event_datetime);
    return dateA.getTime() - dateB.getTime();
  });

  const getEventTypeBadge = (type: Event['type']) => {
    switch(type) {
      case 'routine':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            Routine
          </span>
        );
      case 'special':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            Special
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            Other
          </span>
        );
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <h3 className="font-semibold text-xl text-foreground">
            Upcoming Events
          </h3>
        </div>
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No events scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <h3 className="font-semibold text-xl text-foreground">
          Upcoming Events
        </h3>
      </div>
      <div className="divide-y divide-border">
        {sortedEvents.map(event => (
          <div 
            key={event.id} 
            className="p-6 hover:bg-accent/50 transition-colors duration-200 group"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {event.title}
                  </h4>
                  {getEventTypeBadge(event.type)}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {format(new Date(event.event_datetime), 'MMM d, yyyy')}
                  </span>
                  <span>•</span>
                  <span>
                    {format(new Date(event.event_datetime), 'h:mm a')}
                    {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'h:mm a')}`}
                  </span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {event.description}
                  </p>
                )}

                {event.whatsapp_group_id && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>Connected to WhatsApp</span>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => onEdit(event)} 
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                aria-label="Edit event"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
