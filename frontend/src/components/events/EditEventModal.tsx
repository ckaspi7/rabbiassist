import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Event } from '@/hooks/useEvents';
import { Checkbox } from '@/components/ui/checkbox';
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

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onSubmit: (id: string, updates: Partial<Event>) => void;
  onDelete: (id: string) => void;
}

const EditEventModal = ({ open, onOpenChange, event, onSubmit, onDelete }: EditEventModalProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('routine');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [customRecurrence, setCustomRecurrence] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      const eventDate = new Date(event.event_datetime);
      setDate(eventDate);
      setStartTime(format(eventDate, 'HH:mm'));
      
      if (event.end_datetime) {
        setEndTime(format(new Date(event.end_datetime), 'HH:mm'));
      } else {
        setEndTime('');
      }
      
      setLocation(event.location || '');
      setDescription(event.description || '');
      setType(event.type);
      
      if (event.recurrence_rule) {
        setIsRecurring(true);
        const rule = event.recurrence_rule.toUpperCase();
        if (rule.includes('FREQ=DAILY')) {
          setRecurrencePattern('daily');
        } else if (rule.includes('FREQ=WEEKLY')) {
          setRecurrencePattern('weekly');
        } else if (rule.includes('FREQ=MONTHLY')) {
          setRecurrencePattern('monthly');
        } else {
          setRecurrencePattern('custom');
          setCustomRecurrence(event.recurrence_rule);
        }
      } else {
        setIsRecurring(false);
        setRecurrencePattern('weekly');
        setCustomRecurrence('');
      }
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!event || !title || !date || !startTime) return;

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

    let recurrenceRule = undefined;
    if (isRecurring) {
      if (recurrencePattern === 'custom' && customRecurrence) {
        recurrenceRule = customRecurrence;
      } else {
        recurrenceRule = `FREQ=${recurrencePattern.toUpperCase()}`;
      }
    }

    onSubmit(event.id, {
      title,
      event_datetime: eventDateTime.toISOString(),
      end_datetime: endDateTime,
      location: location || undefined,
      description: description || undefined,
      type,
      recurrence_rule: recurrenceRule,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    }
  };

  if (!event) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Edit Event</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-semibold text-foreground">Event Name *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Torah Class, Wedding, etc."
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
                <Label htmlFor="type" className="text-base font-semibold text-foreground">Event Type *</Label>
                <Select value={type} onValueChange={(value: string) => setType(value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  className="pl-10 bg-background border-border text-foreground [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:bg-accent [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1"
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
                  className="pl-10 bg-background border-border text-foreground [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:bg-accent [&::-webkit-calendar-picker-indicator]:rounded [&::-webkit-calendar-picker-indicator]:p-1"
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
                placeholder="Main Synagogue, Conference Hall, etc."
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold text-foreground">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about the event..."
                rows={3}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="edit-recurring" className="text-base font-semibold text-foreground cursor-pointer">
                  Recurring Event
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-3 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-recurrence-pattern" className="text-sm font-medium text-foreground">Repeat Pattern</Label>
                    <Select value={recurrencePattern} onValueChange={(value: any) => setRecurrencePattern(value)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border z-50">
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom (RRULE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {recurrencePattern === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-custom-recurrence" className="text-sm font-medium text-foreground">Custom Recurrence Rule</Label>
                      <Input
                        id="edit-custom-recurrence"
                        value={customRecurrence}
                        onChange={(e) => setCustomRecurrence(e.target.value)}
                        placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR"
                        className="bg-background border-border text-foreground"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter an iCalendar RRULE format
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
                className="sm:mr-auto"
              >
                Delete Event
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none border-border">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none bg-primary text-primary-foreground hover:bg-primary/90">
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Are you sure you want to delete this event?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete "{event?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditEventModal;
