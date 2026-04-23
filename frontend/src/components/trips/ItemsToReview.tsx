import React, { useState } from 'react';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '../ui/collapsible';
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
import { useTripItemsToReview, useTrips, useAssignReviewItem, useDeleteReviewItem } from '../../hooks/useTrips';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, FileText, Calendar, CircleAlert, MapPin, CalendarRange, FileIcon } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '../ui/card';

const ItemsToReview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const { data: itemsToReview, isLoading } = useTripItemsToReview();
  const { data: trips } = useTrips();
  const { t } = useTheme();
  const assignItem = useAssignReviewItem();
  const deleteItem = useDeleteReviewItem();
  
  const handleAssignToTrip = (reviewItemId: string, tripId: string, type: string, status: string, documentUrl: string | null, destination: string | null) => {
    assignItem.mutate({
      reviewItemId,
      tripId,
      type,
      status: status || 'incomplete',
      documentUrl,
      destination
    });
  };
  
  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      deleteItem.mutate(itemToDelete);
      setItemToDelete(null);
      setShowDeleteDialog(false);
    }
  };
  
  const getItemTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flight':
        return <span className="text-2xl">✈️</span>;
      case 'hotel':
        return <span className="text-2xl">🏨</span>;
      case 'car':
        return <span className="text-2xl">🚗</span>;
      case 'insurance':
        return <span className="text-2xl">🛡️</span>;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const getFileUrl = async (storagePath: string) => {
    const { data } = await supabase.storage
      .from('trip-documents')
      .createSignedUrl(storagePath, 3600);
    return data?.signedUrl;
  };
  
  const handleFileClick = async (storagePath: string) => {
    const url = await getFileUrl(storagePath);
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  const groupTripsByYearAndMonth = () => {
    if (!trips) return {};
    
    const grouped: Record<string, Record<string, typeof trips>> = {};
    
    trips.forEach(trip => {
      if (!trip.start_date) return;
      
      const date = new Date(trip.start_date);
      const year = date.getFullYear().toString();
      const month = format(date, 'MMMM');
      
      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(trip);
    });
    
    return grouped;
  };
  
  const formatTripDisplay = (trip: any) => {
    if (!trip.start_date) return trip.title;
    const date = new Date(trip.start_date);
    const formattedDate = format(date, 'MMMM d');
    return trip.destination 
      ? `${trip.destination} on ${formattedDate}`
      : `${trip.title} on ${formattedDate}`;
  };
  
  // Don't render if there are no items to review
  if (!isLoading && (!itemsToReview || itemsToReview.length === 0)) {
    return null;
  }
  
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6 overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-medium text-amber-800 dark:text-amber-200">{t('itemsToReview')}</h2>
          {isLoading ? (
            <Skeleton className="h-6 w-6 rounded-full" />
          ) : (
            <span className="bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs px-2 py-1 rounded-full">
              {itemsToReview?.length || 0}
            </span>
          )}
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="hover:bg-amber-100 dark:hover:bg-amber-800">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="px-6 pb-4 space-y-3">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              {itemsToReview?.map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Icon and Type */}
                    <div className="flex items-start gap-3 md:w-1/4">
                      <div className="shrink-0">{getItemTypeIcon(item.type)}</div>
                      <div className="min-w-0">
                        <div className="font-semibold capitalize text-sm">
                          {t(item.type?.toLowerCase() || 'document')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Added {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {/* Dates */}
                      {(item.start_date || item.end_date) && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <CalendarRange className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground/80 truncate">
                            {item.start_date && formatDate(item.start_date)}
                            {item.start_date && item.end_date && ' - '}
                            {item.end_date && formatDate(item.end_date)}
                          </span>
                        </div>
                      )}
                      
                      {/* Destination */}
                      {item.destination && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground/80 truncate">{item.destination}</span>
                        </div>
                      )}
                      
                      {/* File */}
                      {item.file_name && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {item.storage_path ? (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sm font-normal text-primary hover:text-primary/80 truncate"
                              onClick={() => handleFileClick(item.storage_path!)}
                            >
                              {item.file_name}
                            </Button>
                          ) : (
                            <span className="text-foreground/60 truncate">{item.file_name}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 md:w-auto md:ml-auto shrink-0">
                      <Select 
                        onValueChange={(value) => handleAssignToTrip(
                          item.id, 
                          value, 
                          item.type, 
                          item.status, 
                          item.storage_path ? `/trip-documents/${item.storage_path}` : null, 
                          item.destination
                        )}
                      >
                        <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                          <SelectValue placeholder={t('assignToTrip')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {Object.entries(groupTripsByYearAndMonth())
                            .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                            .map(([year, months]) => (
                              <div key={year}>
                                <div className="sticky top-0 z-10 px-2 py-2 text-xs font-semibold text-muted-foreground bg-background border-b">
                                  {year}
                                </div>
                                {Object.entries(months)
                                  .sort(([monthA], [monthB]) => {
                                    const dateA = new Date(`${monthA} 1, ${year}`);
                                    const dateB = new Date(`${monthB} 1, ${year}`);
                                    return dateA.getTime() - dateB.getTime();
                                  })
                                  .map(([month, monthTrips]) => (
                                    <div key={`${year}-${month}`}>
                                      <div className="px-3 py-1.5 text-xs font-medium text-foreground/70 bg-muted/30">
                                        {month}
                                      </div>
                                      {monthTrips
                                        .sort((a, b) => {
                                          const dateA = new Date(a.start_date || 0);
                                          const dateB = new Date(b.start_date || 0);
                                          return dateA.getTime() - dateB.getTime();
                                        })
                                        .map((trip) => (
                                          <SelectItem 
                                            key={trip.id} 
                                            value={trip.id}
                                            className="pl-6 text-xs"
                                          >
                                            {formatTripDisplay(trip)}
                                          </SelectItem>
                                        ))}
                                    </div>
                                  ))}
                              </div>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {itemsToReview?.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  {t('noItemsToReview')}
                </div>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteItem}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Collapsible>
  );
};

export default ItemsToReview;
