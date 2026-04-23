import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpandedOccurrence } from '@/lib/recurrence';

interface CalendarProps {
  occurrences: ExpandedOccurrence[];
  onDateClick: (date: Date) => void;
  onOccurrenceClick: (occurrence: ExpandedOccurrence) => void;
  selectedDate: Date;
}

type CalendarView = 'month' | 'week' | 'week-no-weekend' | 'day';

const Calendar = ({ occurrences, onDateClick, onOccurrenceClick, selectedDate }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [currentTime, setCurrentTime] = useState(new Date());
  const timeGridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const navigate = (direction: 'prev' | 'next') => {
    if (view === 'month') {
      setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === 'week' || view === 'week-no-weekend') {
      setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === 'prev' ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    
    if (view !== 'month' && timeGridRef.current) {
      setTimeout(() => {
        const currentHour = now.getHours();
        const startHour = 6;
        const hourHeight = 60;
        const scrollPosition = Math.max(0, (currentHour - startHour) * hourHeight);
        timeGridRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }, 100);
    }
  };

  const renderHeader = () => {
    let title = '';
    if (view === 'month') {
      title = format(currentDate, 'MMMM yyyy');
    } else if (view === 'week' || view === 'week-no-weekend') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = view === 'week-no-weekend' 
        ? addDays(weekStart, 4) 
        : addDays(weekStart, 6);
      title = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      title = format(currentDate, 'EEEE, MMMM d, yyyy');
    }

    return (
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-2xl text-foreground">
          {title}
        </h3>
        <div className="flex gap-2 items-center">
          <Select value={view} onValueChange={(v) => setView(v as CalendarView)}>
            <SelectTrigger className="w-[140px] bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-border z-50">
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="week-no-weekend">Workweek</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-border hover:bg-accent transition-colors duration-200"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Today
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border hover:bg-accent transition-all duration-200"
            onClick={() => navigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border hover:bg-accent transition-all duration-200"
            onClick={() => navigate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderOccurrenceTag = (occ: ExpandedOccurrence, showTime = false, compact = false) => (
    <div 
      key={occ.occurrence_id} 
      className={`
        text-xs px-2 py-1 rounded-md font-medium truncate transition-colors duration-200 cursor-pointer
        ${occ.type === 'routine' 
          ? 'bg-primary/20 text-primary hover:bg-primary/30' 
          : occ.type === 'special' 
          ? 'bg-accent text-accent-foreground hover:bg-accent/80' 
          : 'bg-muted text-muted-foreground hover:bg-muted/80'}
        ${occ.is_recurring ? 'border-l-2 border-primary/50' : ''}
      `}
      title={`${occ.title}${occ.is_recurring ? ' (Recurring)' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onOccurrenceClick(occ);
      }}
    >
      <div className="flex items-center gap-1">
        {occ.is_recurring && <RefreshCw className="h-2.5 w-2.5 flex-shrink-0" />}
        {showTime && (
          <span className="font-semibold">{format(new Date(occ.occurrence_start), 'h:mm')}</span>
        )}
        <span className="truncate">{occ.title}</span>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    let day = startDate;
    const rows = [];

    while (day <= endDate) {
      let cells = [];
      
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateFormatted = format(cloneDay, 'd');
        
        const dayOccurrences = occurrences.filter(occ => 
          isSameDay(new Date(occ.occurrence_start), cloneDay)
        );
        
        const isCurrentMonth = isSameMonth(day, currentDate);
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        
        cells.push(
          <div 
            key={day.toString()}
            className={`
              min-h-[100px] p-2 rounded-lg border transition-all duration-200 cursor-pointer
              ${isCurrentMonth ? 'bg-card border-border' : 'bg-muted/30 border-transparent'}
              ${isToday ? 'ring-2 ring-primary' : ''}
              ${isSelected ? 'bg-primary/10 border-primary' : ''}
              hover:shadow-md hover:scale-[1.02]
              ${!isCurrentMonth && 'opacity-50'}
            `}
            onClick={() => onDateClick(cloneDay)}
          >
            <div className={`
              text-sm font-semibold mb-1
              ${isToday ? 'text-primary' : 'text-foreground'}
              ${!isCurrentMonth && 'text-muted-foreground'}
            `}>
              {dateFormatted}
            </div>
            <div className="space-y-1">
              {dayOccurrences.slice(0, 2).map((occ) => renderOccurrenceTag(occ))}
              {dayOccurrences.length > 2 && (
                <div className="text-xs text-primary font-semibold px-2">
                  +{dayOccurrences.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-2">
          {cells}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2 mb-3">
          {days.map(d => (
            <div key={d} className="text-center font-semibold text-muted-foreground text-sm py-3">
              {d}
            </div>
          ))}
        </div>
        <div className="space-y-2">{rows}</div>
      </div>
    );
  };

  const renderWeekView = (includeWeekends: boolean) => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = includeWeekends ? 7 : 5;
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const hourHeight = 60;
    const currentTimePosition = currentHour * hourHeight + (currentMinutes / 60) * hourHeight;
    const isToday = Array.from({ length: days }, (_, i) => addDays(weekStart, i)).some(d => isSameDay(d, currentTime));
    const showCurrentTimeLine = isToday;

    return (
      <div className="space-y-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${days}, 1fr)` }}>
          <div></div>
          {Array.from({ length: days }, (_, i) => {
            const day = addDays(weekStart, i);
            const isDayToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <div 
                key={i}
                onClick={() => onDateClick(day)}
                className={`
                  text-center py-3 rounded-lg cursor-pointer transition-all duration-200
                  ${isDayToday ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                  ${isSelected && !isDayToday ? 'bg-primary/10 border border-primary' : ''}
                `}
              >
                <div className="text-sm font-semibold">{format(day, 'EEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>

        <div ref={timeGridRef} className="relative border border-border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto scroll-smooth">
          {showCurrentTimeLine && (
            <div 
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ top: `${currentTimePosition}px` }}
            >
              <div className="flex items-center">
                <div className="w-20 flex justify-end pr-2">
                  <div className="bg-destructive text-destructive-foreground text-xs px-1 rounded">
                    {format(currentTime, 'h:mm a')}
                  </div>
                </div>
                <div className="flex-1 h-[2px] bg-destructive"></div>
              </div>
            </div>
          )}
          <div className="grid gap-0" style={{ gridTemplateColumns: `80px repeat(${days}, 1fr)` }}>
            {hours.map(hour => (
              <div key={hour} className="contents">
                <div className="border-t border-border p-2 text-xs text-muted-foreground sticky left-0 bg-background">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                {Array.from({ length: days }, (_, i) => {
                  const day = addDays(weekStart, i);
                  const hourOccurrences = occurrences.filter(occ => {
                    const occDate = new Date(occ.occurrence_start);
                    return isSameDay(occDate, day) && occDate.getHours() === hour;
                  });

                  return (
                    <div 
                      key={`${hour}-${i}`}
                      className="border-t border-l border-border min-h-[60px] p-1 hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                      onClick={() => onDateClick(day)}
                    >
                      {hourOccurrences.map((occ) => (
                        <div 
                          key={occ.occurrence_id}
                          className={`
                            text-xs px-2 py-1 rounded mb-1 font-medium transition-all duration-200 hover:scale-105 cursor-pointer
                            ${occ.type === 'routine' 
                              ? 'bg-primary/80 text-primary-foreground' 
                              : occ.type === 'special' 
                              ? 'bg-accent text-accent-foreground border border-border' 
                              : 'bg-muted text-muted-foreground'}
                            ${occ.is_recurring ? 'border-l-2 border-primary' : ''}
                          `}
                          title={`${occ.title} - ${format(new Date(occ.occurrence_start), 'h:mm a')}${occ.is_recurring ? ' (Recurring)' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOccurrenceClick(occ);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {occ.is_recurring && <RefreshCw className="h-2.5 w-2.5" />}
                            <span className="font-semibold">{format(new Date(occ.occurrence_start), 'h:mm')}</span>
                          </div>
                          <div className="truncate">{occ.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dayOccurrences = occurrences.filter(occ => 
      isSameDay(new Date(occ.occurrence_start), currentDate)
    );
    
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const hourHeight = 80;
    const currentTimePosition = currentHour * hourHeight + (currentMinutes / 60) * hourHeight;
    const showCurrentTimeLine = isSameDay(currentDate, currentTime);

    return (
      <div className="space-y-4">
        <div 
          className="text-center py-4 bg-card border border-border rounded-lg cursor-pointer hover:bg-accent transition-all duration-200"
          onClick={() => onDateClick(currentDate)}
        >
          <div className="text-sm text-muted-foreground">{format(currentDate, 'EEEE')}</div>
          <div className="text-3xl font-bold">{format(currentDate, 'd')}</div>
          <div className="text-sm text-muted-foreground">{format(currentDate, 'MMMM yyyy')}</div>
        </div>

        <div ref={timeGridRef} className="relative border border-border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto scroll-smooth">
          {showCurrentTimeLine && (
            <div 
              className="absolute left-0 right-0 z-10 pointer-events-none"
              style={{ top: `${currentTimePosition}px` }}
            >
              <div className="flex items-center">
                <div className="w-24 flex justify-end pr-2">
                  <div className="bg-destructive text-destructive-foreground text-xs px-1 rounded">
                    {format(currentTime, 'h:mm a')}
                  </div>
                </div>
                <div className="flex-1 h-[2px] bg-destructive"></div>
              </div>
            </div>
          )}
          {hours.map(hour => {
            const hourOccurrences = dayOccurrences.filter(occ => {
              const occDate = new Date(occ.occurrence_start);
              return occDate.getHours() === hour;
            });

            return (
              <div key={hour} className="border-t border-border flex">
                <div className="w-24 p-3 text-sm font-semibold text-muted-foreground bg-muted/30">
                  {format(new Date().setHours(hour, 0), 'h:mm a')}
                </div>
                <div 
                  className="flex-1 p-3 min-h-[80px] hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                  onClick={() => onDateClick(currentDate)}
                >
                  {hourOccurrences.map((occ) => (
                    <div 
                      key={occ.occurrence_id}
                      className={`
                        p-3 rounded-lg mb-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md cursor-pointer
                        ${occ.type === 'routine' 
                          ? 'bg-primary/20 border-l-4 border-primary' 
                          : occ.type === 'special' 
                          ? 'bg-accent border-l-4 border-accent-foreground' 
                          : 'bg-muted border-l-4 border-muted-foreground'}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOccurrenceClick(occ);
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            {occ.is_recurring && <RefreshCw className="h-3 w-3 text-primary" />}
                            {occ.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(occ.occurrence_start), 'h:mm a')}
                            {occ.occurrence_end && ` - ${format(new Date(occ.occurrence_end), 'h:mm a')}`}
                          </div>
                          {occ.location && (
                            <div className="text-sm text-muted-foreground mt-1">📍 {occ.location}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {occ.is_override && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 font-medium">
                              Modified
                            </span>
                          )}
                          <span className={`
                            text-xs px-2 py-1 rounded-full font-medium
                            ${occ.type === 'routine' 
                              ? 'bg-primary/30 text-primary' 
                              : occ.type === 'special' 
                              ? 'bg-accent text-accent-foreground' 
                              : 'bg-muted text-muted-foreground'}
                          `}>
                            {occ.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 transition-all duration-300">
      {renderHeader()}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView(true)}
      {view === 'week-no-weekend' && renderWeekView(false)}
      {view === 'day' && renderDayView()}
    </div>
  );
};

export default Calendar;
