
import React, { useState } from 'react';
import PageTitle from '../components/shared/PageTitle';
import ReminderList from '../components/reminders/ReminderList';
import AddReminderModal from '../components/reminders/AddReminderModal';
import EditReminderModal from '../components/reminders/EditReminderModal';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
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
import { Plus, Filter, ChevronDown, Trash2, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useReminders, DatabaseReminder } from '../hooks/useReminders';
import { useToast } from '../hooks/use-toast';
import { format, isPast, isToday, isTomorrow } from 'date-fns';

const Reminders = () => {
  const { 
    reminders, 
    isLoading, 
    createReminder, 
    updateReminder, 
    deleteReminder, 
    deleteMultipleReminders, 
    toggleComplete 
  } = useReminders();
  
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'title-asc' | 'title-desc' | 'created-asc' | 'created-desc'>('date-asc');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingReminder, setEditingReminder] = useState<DatabaseReminder | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleEdit = (reminder: DatabaseReminder) => {
    setEditingReminder(reminder);
    setEditModalOpen(true);
  };

  const handleSelectReminder = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === filteredAndSortedReminders.length 
        ? [] 
        : filteredAndSortedReminders.map(r => r.id)
    );
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      await deleteMultipleReminders(selectedIds);
      setSelectedIds([]);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteSingle = (id: string) => {
    setReminderToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteSingle = async () => {
    if (!reminderToDelete) return;
    
    try {
      await deleteReminder(reminderToDelete);
      setReminderToDelete(null);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedIds.length > 0) {
      await confirmDeleteSelected();
    } else if (reminderToDelete) {
      await confirmDeleteSingle();
    }
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Filter and sort reminders
  const filteredAndSortedReminders = React.useMemo(() => {
    let filtered = reminders.filter(reminder => {
      // Search filter - only search by title
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = reminder.title.toLowerCase().includes(searchLower);
        
        if (!matchesTitle) {
          return false;
        }
      }

      if (selectedFilters.length === 0) return true;
      
      // Status filters
      if (selectedFilters.includes('completed') && reminder.is_completed) return true;
      if (selectedFilters.includes('pending') && !reminder.is_completed) return true;
      if (selectedFilters.includes('overdue')) {
        const dueDate = reminder.due_date ? new Date(reminder.due_date) : null;
        if (dueDate && !reminder.is_completed && dueDate < new Date() && !isToday(dueDate)) return true;
      }
      if (selectedFilters.includes('upcoming')) {
        const dueDate = reminder.due_date ? new Date(reminder.due_date) : null;
        if (dueDate && !reminder.is_completed && !isPast(dueDate)) return true;
      }
      
      // Source filters
      if (selectedFilters.includes('notes') && reminder.source === 'ios-notes') return true;
      if (selectedFilters.includes('trip') && reminder.source === 'trips') return true;
      
      return false;
    });

    // Sort reminders
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy.startsWith('date')) {
        const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        comparison = aDate - bDate;
      } else if (sortBy.startsWith('title')) {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy.startsWith('created')) {
        const aDate = new Date(a.created_at || '').getTime();
        const bDate = new Date(b.created_at || '').getTime();
        comparison = bDate - aDate; // Most recent first
      }
      
      return sortBy.endsWith('-desc') ? -comparison : comparison;
    });

    return filtered;
  }, [reminders, selectedFilters, sortBy, searchTerm]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading reminders...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageTitle title="Reminders" subtitle="Manage your tasks and reminders" />
      </div>

      {/* Controls Row - All on one line */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background border-border"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 rounded-xl">
              <Filter size={16} className="mr-2" />
              Filter ({selectedFilters.length})
              <ChevronDown size={16} className="ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 rounded-xl">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Status</h4>
                <div className="space-y-2">
                  {['upcoming', 'overdue', 'completed', 'pending'].map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={status}
                        checked={selectedFilters.includes(status)}
                        onCheckedChange={() => handleFilterChange(status)}
                      />
                      <label htmlFor={status} className="text-sm capitalize">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Source</h4>
                <div className="space-y-2">
                  {['notes', 'trip'].map(source => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={source}
                        checked={selectedFilters.includes(source)}
                        onCheckedChange={() => handleFilterChange(source)}
                      />
                      <label htmlFor={source} className="text-sm capitalize">
                        {source}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
          <SelectTrigger className="w-44 h-10 rounded-xl">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="date-asc">Due Date (A-Z)</SelectItem>
            <SelectItem value="date-desc">Due Date (Z-A)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            <SelectItem value="created-asc">Created (A-Z)</SelectItem>
            <SelectItem value="created-desc">Created (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {filteredAndSortedReminders.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
            className="h-10 rounded-xl"
          >
            {selectedIds.length === filteredAndSortedReminders.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}

        {selectedIds.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="h-10 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
          >
            <Trash2 size={16} className="mr-2" /> 
            Delete ({selectedIds.length})
          </Button>
        )}

        <AddReminderModal onAddReminder={async (reminder) => { await createReminder(reminder); }} />
      </div>

      <ReminderList
        reminders={filteredAndSortedReminders}
        onToggleComplete={toggleComplete}
        onDelete={handleDeleteSingle}
        onEdit={handleEdit}
        selectedIds={selectedIds}
        onSelectReminder={handleSelectReminder}
      />

      <EditReminderModal
        reminder={editingReminder}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUpdateReminder={async (id, updates) => { await updateReminder(id, updates); }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.length > 0 
                ? `This will permanently delete ${selectedIds.length} reminder${selectedIds.length !== 1 ? 's' : ''}. This action cannot be undone.`
                : 'This will permanently delete this reminder. This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setReminderToDelete(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reminders;
