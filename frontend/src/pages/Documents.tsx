
import React, { useState, useRef, useEffect } from 'react';
import PageTitle from '../components/shared/PageTitle';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { 
  Plus, 
  Search, 
  Loader2,
  FileText,
  Trash2
} from 'lucide-react';
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
import { useReceipts, useDeleteReceipt } from '../hooks/useReceipts';
import { useDocuments, useDeleteDocument } from '../hooks/useDocuments';
import { useWhatsAppDocs, useDeleteWhatsAppDoc } from '../hooks/useWhatsAppDocs';
import DocumentCard from '../components/documents/DocumentCard';
import { UnifiedDocument } from '../types/documents';
import { useToast } from '../hooks/use-toast';

const Documents = () => {
  const { t } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: receipts = [], isLoading: loadingReceipts } = useReceipts();
  const { data: tripDocuments = [], isLoading: loadingTripDocs } = useDocuments();
  const { data: whatsappDocs = [], isLoading: loadingWhatsAppDocs } = useWhatsAppDocs();
  
  const { mutateAsync: deleteReceiptMutation } = useDeleteReceipt();
  const { mutateAsync: deleteDocumentMutation } = useDeleteDocument();
  const { mutateAsync: deleteWhatsAppDocMutation } = useDeleteWhatsAppDoc();

  // Combine all documents into unified format
  const unifiedDocuments: UnifiedDocument[] = [
    ...receipts.map(receipt => ({
      id: receipt.id,
      type: 'receipts' as const,
      title: receipt.vendor || 'Unknown Vendor',
      fileName: receipt.file_name,
      uploadDate: receipt.created_at,
      status: receipt.status,
      storagePath: receipt.storage_path,
      mimeType: receipt.mime_type,
      amount: receipt.total_amount,
      expenseDate: receipt.expense_date,
      details: receipt.details,
      category: receipt.category
    })),
    ...tripDocuments.map(doc => ({
      id: doc.id,
      type: 'trips' as const,
      title: doc.original_name || doc.file_name,
      fileName: doc.file_name,
      uploadDate: doc.created_at,
      status: 'New' as const,
      storagePath: doc.storage_path,
      mimeType: doc.mime_type,
      docType: doc.type,
      originalName: doc.original_name
    })),
    ...whatsappDocs.map(doc => ({
      id: doc.id,
      type: 'whatsapp' as const,
      title: doc.file_name,
      fileName: doc.file_name,
      uploadDate: doc.created_at,
      status: (doc.status as 'New' | 'Reviewed' | 'Exported') || 'New',
      storagePath: doc.storage_path,
      mimeType: doc.mime_type
    }))
  ];

  // Get available months from all documents
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    unifiedDocuments.forEach(doc => {
      if (doc.uploadDate) {
        const date = new Date(doc.uploadDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [unifiedDocuments]);

  const filteredDocuments = unifiedDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    
    // Month filtering
    let matchesMonth = true;
    if (selectedMonth !== 'all') {
      const docDate = new Date(doc.uploadDate || '');
      const docMonth = `${docDate.getFullYear()}-${String(docDate.getMonth() + 1).padStart(2, '0')}`;
      matchesMonth = docMonth === selectedMonth;
    }
    
    return matchesSearch && matchesType && matchesMonth;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.uploadDate || '').getTime() - new Date(a.uploadDate || '').getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.uploadDate || '').getTime() - new Date(b.uploadDate || '').getTime();
    } else if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle file upload logic here
      console.log('File selected:', file);
    }
  };

  const handleSelectDocument = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === sortedDocuments.length 
        ? [] 
        : sortedDocuments.map(d => `${d.type}-${d.id}`)
    );
  };

  const confirmDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      const deletePromises = selectedIds.map(compositeId => {
        const firstHyphenIndex = compositeId.indexOf('-');
        const type = compositeId.substring(0, firstHyphenIndex);
        const id = compositeId.substring(firstHyphenIndex + 1);
        
        if (type === 'receipts') {
          return deleteReceiptMutation(id);
        } else if (type === 'trips') {
          return deleteDocumentMutation(id);
        } else if (type === 'whatsapp') {
          return deleteWhatsAppDocMutation(id);
        }
        return Promise.resolve();
      });
      
      await Promise.all(deletePromises);
      setSelectedIds([]);
      setShowDeleteDialog(false);
      toast({ title: 'Success', description: `${selectedIds.length} document(s) deleted successfully` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete some documents', variant: 'destructive' });
    }
  };

  const isLoading = loadingReceipts || loadingTripDocs || loadingWhatsAppDocs;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading documents...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <PageTitle 
        title="Documents Vault" 
        subtitle="Manage and access all your uploaded documents"
      />
      
      {/* Header Actions */}
      <div className="mb-8 space-y-6">
        {/* Search and Upload Row */}
        <div className="flex gap-4 justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            {sortedDocuments.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
                className="rounded-xl"
              >
                {selectedIds.length === sortedDocuments.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
            
            {selectedIds.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
              >
                <Trash2 size={16} className="mr-2" /> 
                Delete ({selectedIds.length})
              </Button>
            )}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-12 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                <SelectValue placeholder="Sort by: Recent" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="recent">Sort by: Recent</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                <SelectItem value="name">Sort by: Name</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48 h-12 rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map((month) => {
                  const [year, monthNum] = month.split('-');
                  const monthNames = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ];
                  const monthName = monthNames[parseInt(monthNum) - 1];
                  return (
                    <SelectItem key={month} value={month}>
                      {monthName} {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Document
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            className="rounded-xl h-10 px-6 shadow-sm"
          >
            All Documents
          </Button>
          <Button
            variant={typeFilter === 'trips' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('trips')}
            className="rounded-xl h-10 px-6 shadow-sm"
          >
            Trips
          </Button>
          <Button
            variant={typeFilter === 'receipts' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('receipts')}
            className="rounded-xl h-10 px-6 shadow-sm"
          >
            Receipts
          </Button>
          <Button
            variant={typeFilter === 'whatsapp' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('whatsapp')}
            className="rounded-xl h-10 px-6 shadow-sm"
          >
            WhatsApp Exports
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sortedDocuments.map((document) => (
          <DocumentCard
            key={`${document.type}-${document.id}`}
            document={document}
            isSelected={selectedIds.includes(`${document.type}-${document.id}`)}
            onSelect={() => handleSelectDocument(`${document.type}-${document.id}`)}
          />
        ))}
      </div>

      {sortedDocuments.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-12 max-w-md mx-auto">
            <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">No documents found</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
              {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first document to get started.'}
            </p>
            <Button
              size="sm"
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          // User closed dialog without confirming - do nothing
          setShowDeleteDialog(false);
        }
      }}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you sure you want to delete the selected item{selectedIds.length !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete <span className="font-semibold text-red-600">{selectedIds.length} document{selectedIds.length !== 1 ? 's' : ''}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSelected}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
