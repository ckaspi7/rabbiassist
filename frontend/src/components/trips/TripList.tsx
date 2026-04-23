import React, { useState } from 'react';
import { format, isBefore, startOfMonth } from 'date-fns';
import TripCard from './TripCard';
import { useTrips } from '../../hooks/useTrips';
import { Skeleton } from '../ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface GroupedTrips {
  [key: string]: any[];
}

const TripList = () => {
  const { data: trips, isLoading } = useTrips();
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({});

  // Group trips by month
  const groupTripsByMonth = (trips: any[]): GroupedTrips => {
    if (!trips) return {};
    
    return trips.reduce((acc: GroupedTrips, trip) => {
      if (!trip.start_date) return acc;
      
      const monthYear = format(new Date(trip.start_date), 'MMMM yyyy');
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      
      acc[monthYear].push(trip);
      return acc;
    }, {});
  };

  // Check if a month should be collapsed by default (past months)
  const shouldCollapseByDefault = (monthYear: string) => {
    try {
      const monthDate = new Date(monthYear + ' 1'); // Add day to make it a valid date
      const currentMonth = startOfMonth(new Date());
      return isBefore(monthDate, currentMonth);
    } catch (e) {
      return false; // If date parsing fails, don't collapse
    }
  };

  const toggleMonth = (month: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  const isMonthExpanded = (month: string) => {
    // If user has explicitly set state, use that
    if (expandedMonths.hasOwnProperty(month)) {
      return expandedMonths[month];
    }
    // Otherwise, use default logic (collapse past months)
    return !shouldCollapseByDefault(month);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const groupedTrips = groupTripsByMonth(trips || []);

  if (!trips || trips.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 text-center">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">No trips yet</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Add a new trip to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedTrips).map(([month, monthTrips]) => {
        const isExpanded = isMonthExpanded(month);

        return (
          <Collapsible
            key={month}
            open={isExpanded}
            onOpenChange={() => toggleMonth(month)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]"
          >
            <CollapsibleTrigger className="w-full flex justify-between items-center px-6 py-4 bg-zinc-950 dark:bg-zinc-900 text-zinc-300 hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors">
              <h3 className="text-sm font-semibold tracking-tight">{month}</h3>
              <span className="text-zinc-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </CollapsibleTrigger>

            <CollapsibleContent className="border-t border-zinc-100 dark:border-zinc-800">
              {monthTrips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default TripList;
