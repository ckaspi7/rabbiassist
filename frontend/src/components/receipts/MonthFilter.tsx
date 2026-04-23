
import React from 'react';
import { Card } from '../ui/card';
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
    <Card className="p-4 bg-white dark:bg-black border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filter by Month</h3>
      
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
        
        {availableMonths.map((month) => {
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
    </Card>
  );
};

export default MonthFilter;
