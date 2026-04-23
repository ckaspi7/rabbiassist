
import React from 'react';
import { Button } from '../ui/button';
import { Check } from 'lucide-react';

interface MonthFilterProps {
  selectedMonths: string[];
  onMonthToggle: (month: string) => void;
  onSelectAll: () => void;
  availableMonths: string[];
}

const MonthFilter = ({ selectedMonths, onMonthToggle, onSelectAll, availableMonths }: MonthFilterProps) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const allSelected = selectedMonths.includes('all') || selectedMonths.length === availableMonths.length;

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">By Month</p>
      
      <div className="space-y-2">
        <Button
          variant={allSelected ? "default" : "outline"}
          size="sm"
          onClick={onSelectAll}
          className="w-full justify-between text-xs"
        >
          All Months
          {allSelected && <Check className="h-3 w-3" />}
        </Button>
        
        {availableMonths.map((month: string) => {
          const monthIndex = parseInt(month.split('-')[1]) - 1;
          const year = month.split('-')[0];
          const monthName = monthNames[monthIndex];
          const isSelected = selectedMonths.includes(month) || allSelected;
          
          return (
            <Button
              key={month}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onMonthToggle(month)}
              className="w-full justify-between text-xs"
              disabled={allSelected}
            >
              {monthName} {year}
              {isSelected && <Check className="h-3 w-3" />}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthFilter;
