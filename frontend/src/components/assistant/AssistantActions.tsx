
import React from 'react';
import { Button } from '../ui/button';

interface AssistantActionsProps {
  onShowTrip: () => void;
  onAddReminder: () => void;
  onScheduleEvent: () => void;
}

const AssistantActions = ({ onShowTrip, onAddReminder, onScheduleEvent }: AssistantActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onShowTrip}
        className="text-torah-blue border-torah-blue hover:bg-torah-lightBlue/30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M3 7H21"></path>
          <path d="M3 14H21"></path>
          <path d="M3 21H21"></path>
          <path d="M9 14L5 18"></path>
          <path d="M9 14L5 10"></path>
          <path d="M17 14L21 18"></path>
          <path d="M17 14L21 10"></path>
        </svg>
        Show My Istanbul Trip
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onAddReminder}
        className="text-torah-blue border-torah-blue hover:bg-torah-lightBlue/30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Add Reminder
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onScheduleEvent}
        className="text-torah-blue border-torah-blue hover:bg-torah-lightBlue/30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        Schedule Event
      </Button>
    </div>
  );
};

export default AssistantActions;
