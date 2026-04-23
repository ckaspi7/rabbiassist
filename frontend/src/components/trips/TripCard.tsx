
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTripItems, useUpdateTripItem, useDeleteTrip } from '../../hooks/useTrips';
import { useDocuments } from '../../hooks/useDocuments';
import { useTheme } from '../../contexts/ThemeContext';
import { Skeleton } from '../ui/skeleton';
import { MoreVertical, PencilIcon, Trash2Icon, CheckCircle, XCircle, Clock, CircleDot, RotateCcw, Plane, Building2, Car, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DocumentLink from '../shared/DocumentLink';

interface TripCardProps {
  trip: any;
}

const TripCard = ({ trip }: TripCardProps) => {
  const { data: tripItems, isLoading } = useTripItems(trip.id);
  const { data: documents } = useDocuments();
  const updateTripItem = useUpdateTripItem();
  const deleteTrip = useDeleteTrip();
  const { t } = useTheme();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: trip.title || '',
    destination: trip.destination || '',
    start_date: trip.start_date || '',
    end_date: trip.end_date || ''
  });
  const [manualStatuses, setManualStatuses] = useState<{ [key: string]: string }>({});
  
  // Filter documents for this trip
  const tripDocuments = documents?.filter(doc => doc.trip_id === trip.id) || [];
  
  const getFormattedDateRange = (start: string | null, end: string | null) => {
    if (!start) return 'Invalid date';
    
    // Parse dates without timezone conversion to avoid day-behind issues
    const startDate = new Date(start + 'T00:00:00');
    
    // Handle one-way flights (null end_date)
    if (!end) {
      return format(startDate, 'MMM d, yyyy');
    }
    
    const endDate = new Date(end + 'T00:00:00');
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateTripItem.mutate({ id: itemId, status: newStatus });
  };

  const handleManualStatusChange = (type: string, newStatus: string) => {
    setManualStatuses(prev => ({
      ...prev,
      [type]: newStatus
    }));
  };
  
  const handleDeleteTrip = () => {
    deleteTrip.mutate(trip.id, {
      onSuccess: () => {
        setIsDeleteConfirmOpen(false);
      }
    });
  };

  const handleEditTrip = () => {
    setEditForm({
      title: trip.title || '',
      destination: trip.destination || '',
      start_date: trip.start_date || '',
      end_date: trip.end_date || ''
    });
    setIsEditDialogOpen(true);
  };

  const getItemsByType = (type: string) => {
    if (!tripItems) return null;
    return tripItems.filter(item => item.type.toLowerCase() === type.toLowerCase());
  };
  
  const renderStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'booked':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rescheduled':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'not needed':
        return <CircleDot className="h-4 w-4 text-gray-400" />;
      default:
        return <CircleDot className="h-4 w-4 text-orange-500" />;
    }
  };
  
  const getStatusOptions = () => [
    { value: 'booked', label: t('booked'), icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
    { value: 'pending', label: t('pending'), icon: <Clock className="h-4 w-4 text-amber-500" /> },
    { value: 'rescheduled', label: t('rescheduled'), icon: <RotateCcw className="h-4 w-4 text-blue-500" /> },
    { value: 'cancelled', label: t('cancelled'), icon: <XCircle className="h-4 w-4 text-red-500" /> },
    { value: 'not needed', label: t('notNeeded'), icon: <CircleDot className="h-4 w-4 text-gray-400" /> },
    { value: 'incomplete', label: t('incomplete'), icon: <CircleDot className="h-4 w-4 text-orange-500" /> }
  ];

  const renderTripItem = (type: string, ItemIcon: React.ElementType) => {
    const items = getItemsByType(type);
    const manualStatus = manualStatuses[type];

    if (isLoading) {
      return (
        <div className="checklist-item">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <ItemIcon className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <span className="text-sm">{t(type.toLowerCase())}</span>
          <Skeleton className="h-4 w-4 ml-auto" />
        </div>
      );
    }

    if (!items || items.length === 0) {
      const currentStatus = manualStatus || 'incomplete';
      return (
        <div className="checklist-item">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <ItemIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <span className="text-sm">{t(type.toLowerCase())}</span>
          <div className="flex items-center ml-auto gap-2">
            {renderStatusIcon(currentStatus)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-zinc-400 font-medium">
                  Set Status
                </DropdownMenuItem>
                {getStatusOptions().map(option => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleManualStatusChange(type, option.value)}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      );
    }

    return items.map(item => (
      <div
        key={item.id}
        className={`checklist-item ${item.status === 'booked' ? 'checklist-item-complete' : ''}`}
      >
        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <ItemIcon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
        </div>
        <span className="text-sm">{t(type.toLowerCase())}</span>
        <div className="flex items-center ml-auto gap-2">
          {renderStatusIcon(item.status)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-6 w-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-xs text-zinc-400 font-medium">
                Set Status
              </DropdownMenuItem>
              {getStatusOptions().map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(item.id, option.value)}
                  className="flex items-center gap-2"
                >
                  {option.icon}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 last:border-none">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 dark:text-gray-300">
            {getFormattedDateRange(trip.start_date, trip.end_date)}
          </p>
          {trip.destination && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">{trip.destination}</p>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            <DropdownMenuItem 
              className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
              onClick={handleEditTrip}
            >
              <PencilIcon className="h-4 w-4" />
              {t('editTrip')}
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center gap-2 text-red-500 focus:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2Icon className="h-4 w-4" />
              {t('deleteTrip')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Edit trip dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">{t('editTrip')}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Update your trip details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-900 dark:text-white">Trip Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="destination" className="text-gray-900 dark:text-white">Destination</Label>
                <Input
                  id="destination"
                  value={editForm.destination}
                  onChange={(e) => setEditForm(prev => ({ ...prev, destination: e.target.value }))}
                  className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date" className="text-gray-900 dark:text-white">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-gray-900 dark:text-white">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={editForm.end_date || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
                    placeholder="Leave empty for one-way"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900">
                {t('cancel')}
              </Button>
              <Button 
                onClick={() => {
                  // TODO: Implement trip update functionality
                  setIsEditDialogOpen(false);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">{t('deleteTrip')}</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                {t('confirmDelete')} "{trip.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900">
                {t('cancel')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteTrip}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {t('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {renderTripItem('flight', Plane)}
        {renderTripItem('hotel', Building2)}
        {renderTripItem('car', Car)}
        {renderTripItem('insurance', Shield)}
      </div>

      {/* Trip Documents */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-400 dark:text-gray-400 mb-3">Documents ({tripDocuments.length})</h4>
        {tripDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tripDocuments.map(document => (
              <DocumentLink
                key={document.id}
                fileName={document.file_name}
                storagePath={document.storage_path}
                variant="card"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No documents uploaded for this trip</p>
        )}
      </div>
    </div>
  );
};

export default TripCard;
