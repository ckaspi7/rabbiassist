import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarRange, Trash2 } from 'lucide-react';

export type RecurringAction = 'edit' | 'delete';

interface RecurringEventChoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: RecurringAction;
  onChooseOccurrence: () => void;
  onChooseSeries: () => void;
}

const RecurringEventChoiceModal = ({
  open,
  onOpenChange,
  action,
  onChooseOccurrence,
  onChooseSeries,
}: RecurringEventChoiceModalProps) => {
  const isEdit = action === 'edit';
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-background border-border sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground flex items-center gap-2">
            {isEdit ? (
              <>
                <Calendar className="h-5 w-5 text-primary" />
                Edit Recurring Event
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Recurring Event
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This is a recurring event. Would you like to {isEdit ? 'edit' : 'delete'} only this occurrence or the entire series?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4 px-4 border-border hover:bg-accent"
            onClick={() => {
              onChooseOccurrence();
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  {isEdit ? 'Edit this occurrence' : 'Delete this occurrence'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Only this specific instance will be {isEdit ? 'modified' : 'removed'}
                </div>
              </div>
            </div>
          </Button>
          
          <Button
            variant="outline"
            className={`w-full justify-start h-auto py-4 px-4 border-border hover:bg-accent ${
              !isEdit ? 'hover:border-destructive hover:text-destructive' : ''
            }`}
            onClick={() => {
              onChooseSeries();
              onOpenChange(false);
            }}
          >
            <div className="flex items-start gap-3">
              <CalendarRange className={`h-5 w-5 mt-0.5 ${isEdit ? 'text-muted-foreground' : 'text-destructive'}`} />
              <div className="text-left">
                <div className={`font-semibold ${isEdit ? 'text-foreground' : 'text-destructive'}`}>
                  {isEdit ? 'Edit entire series' : 'Delete entire series'}
                </div>
                <div className="text-sm text-muted-foreground">
                  All occurrences of this event will be {isEdit ? 'modified' : 'removed'}
                </div>
              </div>
            </div>
          </Button>
        </div>
        
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="border-border">
            Cancel
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RecurringEventChoiceModal;
