import React, { useState } from 'react';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { DatabaseReminder } from '../../hooks/useReminders';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface ReminderCardProps {
  reminder: DatabaseReminder;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ReminderCard = ({ 
  reminder, 
  onToggleComplete,
  onDelete,
  onEdit,
  isSelected = false,
  onSelect
}: ReminderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const dueDate = reminder.due_date ? (() => {
    try {
      // Extract just the date part if it's a full timestamp
      const dateStr = reminder.due_date.split('T')[0]; // Get YYYY-MM-DD part
      
      // Parse as local date without timezone conversion
      const [year, month, day] = dateStr.split('-').map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed
      
      return localDate;
    } catch (error) {
      console.error('Date parsing error:', error, 'for date:', reminder.due_date);
      return null;
    }
  })() : null;
  
  const isOverdue = dueDate && !reminder.is_completed && isPast(dueDate) && !isToday(dueDate);
  const isUpcoming = dueDate && !reminder.is_completed && !isPast(dueDate);
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on interactive elements
    if ((e.target as Element).closest('.checkbox-container, .action-button')) {
      return;
    }
    onSelect?.();
  };
  
  const getDateDisplay = () => {
    if (!dueDate) return 'No Due Date';
    
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    return format(dueDate, 'MMM d, yyyy');
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'ios-notes':
        return 'Notes';
      case 'trips':
        return 'Trips';
      default:
        return source;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'ios-notes':
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full px-3 py-1">
            Notes
          </Badge>
        );
      case 'trips':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full px-3 py-1">
            Trips
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full px-3 py-1">
            {source}
          </Badge>
        );
    }
  };

  const getStatusBadge = () => {
    if (reminder.is_completed) {
      return (
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full px-3 py-1">
          Completed
        </Badge>
      );
    }
    
    if (isOverdue) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full px-3 py-1">
          Overdue
        </Badge>
      );
    }
    
    if (isUpcoming) {
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full px-3 py-1">
          Upcoming
        </Badge>
      );
    }
    
    return null;
  };

  // Extract metadata fields
  const metadata = reminder.metadata as { note_title?: string; note_content?: string } | null;
  const noteTitle = metadata?.note_title || 'N/A';
  const noteContent = metadata?.note_content || 'N/A';

  // Build full content for truncation check
  const fullContent = [
    reminder.description || '',
    noteTitle,
    noteContent
  ].join('');

  // Check if content should be truncated (based on total length)
  const shouldTruncate = fullContent.length > 120;

  return (
    <div 
      className={`bg-card rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-border cursor-pointer ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${reminder.is_completed ? 'opacity-60' : ''}`}
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <div className="checkbox-container" onClick={e => e.stopPropagation()}>
          <Checkbox 
            checked={reminder.is_completed}
            onCheckedChange={onToggleComplete}
            className="rounded-md"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg mb-2 ${
                reminder.is_completed 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground'
              }`}>
                {reminder.title}
              </h3>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-muted-foreground text-sm">
                  {getDateDisplay()}
                </span>
                
                {getSourceBadge(reminder.source)}
                
                {getStatusBadge()}
              </div>
              
              {/* Content Section - Consistent font styling with title */}
              <div className="space-y-1.5">
                {isExpanded ? (
                  <>
                    {reminder.description && (
                      <p className="text-sm text-foreground">{reminder.description}</p>
                    )}
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Note Title:</span> {noteTitle}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Note Content:</span> {noteContent}
                    </p>
                  </>
                ) : (
                  <>
                    {reminder.description && (
                      <p className="text-sm text-foreground">
                        {reminder.description.length > 80 ? reminder.description.substring(0, 80) + '...' : reminder.description}
                      </p>
                    )}
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Note Title:</span> {noteTitle.length > 40 ? noteTitle.substring(0, 40) + '...' : noteTitle}
                    </p>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">Note Content:</span> {noteContent.length > 40 ? noteContent.substring(0, 40) + '...' : noteContent}
                    </p>
                  </>
                )}
                
                {shouldTruncate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="mt-1 text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp size={12} />
                      </>
                    ) : (
                      <>
                        Read More <ChevronDown size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 action-button">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
