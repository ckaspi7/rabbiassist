
import React from 'react';
import { DatabaseReminder } from '../../hooks/useReminders';
import ReminderCard from './ReminderCard';

interface ReminderListProps {
  reminders: DatabaseReminder[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (reminder: DatabaseReminder) => void;
  selectedIds?: string[];
  onSelectReminder?: (id: string) => void;
}

const ReminderList = ({ 
  reminders, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  selectedIds = [],
  onSelectReminder
}: ReminderListProps) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-12 max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No reminders yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create your first reminder to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map(reminder => (
        <ReminderCard
          key={reminder.id}
          reminder={reminder}
          onToggleComplete={() => onToggleComplete(reminder.id)}
          onDelete={() => onDelete(reminder.id)}
          onEdit={() => onEdit(reminder)}
          isSelected={selectedIds.includes(reminder.id)}
          onSelect={onSelectReminder ? () => onSelectReminder(reminder.id) : undefined}
        />
      ))}
    </div>
  );
};

export default ReminderList;
