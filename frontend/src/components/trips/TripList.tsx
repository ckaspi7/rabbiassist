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
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-8 w-48 mb-2" />
              <div className="space-y-4 mt-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  const groupedTrips = groupTripsByMonth(trips || []);
  
  // Show empty state if no trips
  if (!trips || trips.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No trips found</h3>
        <p className="text-gray-500">
          You don't have any trips yet. Add a new trip to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTrips).map(([month, monthTrips]) => {
        const isExpanded = isMonthExpanded(month);
        
        return (
          <Collapsible 
            key={month}
            open={isExpanded}
            onOpenChange={() => toggleMonth(month)}
            className="bg-background rounded-xl shadow-md overflow-hidden border"
          >
            <CollapsibleTrigger className="w-full flex justify-between items-center p-6 bg-black text-gray-300 hover:bg-gray-900">
              <h3 className="text-xl font-medium">{month}</h3>
              <span className="text-gray-400">
                {isExpanded ? '▲' : '▼'}
              </span>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="border-t border-gray-100">
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
