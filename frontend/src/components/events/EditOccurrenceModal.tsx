import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ExpandedOccurrence } from '@/lib/recurrence';
import { Badge } from '@/components/ui/badge';

interface EditOccurrenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  occurrence: ExpandedOccurrence | null;
  onSubmit: (overridePayload: {
    title?: string;
    description?: string;
    event_datetime?: string;
    end_datetime?: string;
    location?: string;
  }) => void;
}

const EditOccurrenceModal = ({ open, onOpenChange, occurrence, onSubmit }: EditOccurrenceModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (occurrence) {
      setTitle(occurrence.title || '');
      const occDate = new Date(occurrence.occurrence_start);
      setDate(occDate);
      setStartTime(format(occDate, 'HH:mm'));
      
      if (occurrence.occurrence_end) {
        setEndTime(format(new Date(occurrence.occurrence_end), 'HH:mm'));
      } else {
        setEndTime('');
      }
      
      setLocation(occurrence.location || '');
      setDescription(occurrence.description || '');
    }
  }, [occurrence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!occurrence || !date || !startTime) return;

    const eventDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':');
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));

    let endDateTime: string | undefined;
    if (endTime) {
      const endDate = new Date(date);
      const [endHours, endMinutes] = endTime.split(':');
      endDate.setHours(parseInt(endHours), parseInt(endMinutes));
      endDateTime = endDate.toISOString();
    }

    // Only include fields that changed
    const overridePayload: any = {};
    
    if (title !== occurrence.title) {
      overridePayload.title = title;
    }
    if (description !== (occurrence.description || '')) {
      overridePayload.description = description || undefined;
    }
    if (location !== (occurrence.location || '')) {
      overridePayload.location = location || undefined;
    }
    
    const newStartIso = eventDateTime.toISOString();
    if (newStartIso !== occurrence.occurrence_start) {
      overridePayload.event_datetime = newStartIso;
    }
    
    if (endDateTime !== occurrence.occurrence_end) {
      overridePayload.end_datetime = endDateTime;
    }

    onSubmit(overridePayload);
    onOpenChange(false);
  };

  if (!occurrence) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            Edit This Occurrence
            <Badge variant="secondary" className="ml-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Recurring
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground mb-4">
          <p>You are editing only this specific occurrence. The rest of the series will remain unchanged.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-semibold text-foreground">Event Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-foreground">Type</Label>
              <div className="h-10 flex items-center px-3 rounded-md border border-border bg-muted/50">
                <span className="text-muted-foreground capitalize">{occurrence.type}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-base font-semibold text-foreground">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-base font-semibold text-foreground">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-semibold text-foreground">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold text-foreground">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOccurrenceModal;
