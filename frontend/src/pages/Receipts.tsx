
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
  Filter, 
  Download, 
  Upload,
  ExternalLink,
  Loader2,
  X,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useReceipts, useUpdateReceiptStatus, useUploadReceipt, useDeleteReceipt, Receipt } from '../hooks/useReceipts';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import ReceiptCard from '../components/receipts/ReceiptCard';
import MonthFilter from '../components/receipts/MonthFilter';

interface ReceiptWithPreview extends Receipt {
  previewUrl?: string;
  isLoadingPreview?: boolean;
}

const Receipts = () => {
  const { t } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [receiptsWithPreviews, setReceiptsWithPreviews] = useState<ReceiptWithPreview[]>([]);
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; receipt: Receipt | null }>({
    isOpen: false,
    receipt: null
  });
  const [loadingDownloads, setLoadingDownloads] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; receipt: Receipt | null }>({
    isOpen: false,
    receipt: null
  });
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['all']);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: receipts = [], isLoading } = useReceipts();
  const updateReceiptStatus = useUpdateReceiptStatus();
  const uploadReceipt = useUploadReceipt();
  const deleteReceipt = useDeleteReceipt();

  // Generate preview URLs for receipts
  useEffect(() => {
    const generatePreviews = async () => {
      const updatedReceipts = await Promise.all(
        receipts.map(async (receipt) => {
          if (receipt.storage_path && receipt.mime_type?.startsWith('image/')) {
            try {
              // Remove bucket prefix if it exists since we specify the bucket in .from()
              let filePath = receipt.storage_path;
              if (filePath.startsWith('receipts/')) {
                filePath = filePath.substring('receipts/'.length);
              }

              const { data } = await supabase.storage
                .from('receipts')
                .createSignedUrl(filePath, 3600);
              
              return {
                ...receipt,
                previewUrl: data?.signedUrl || undefined,
                isLoadingPreview: false
              };
            } catch (error) {
              console.error('Error creating signed URL for receipt:', receipt.id, error);
              return { ...receipt, isLoadingPreview: false };
            }
          }
          return { ...receipt, isLoadingPreview: false };
        })
      );
      setReceiptsWithPreviews(updatedReceipts);
    };

    if (receipts.length > 0) {
      generatePreviews();
    } else {
      setReceiptsWithPreviews([]);
    }
  }, [receipts]);

  // Get available months from receipts
  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    receipts.forEach(receipt => {
      if (receipt.expense_date || receipt.created_at) {
        const date = new Date(receipt.expense_date || receipt.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
      }
    });
    return Array.from(months).sort().reverse();
  }, [receipts]);

  const filteredReceipts = receiptsWithPreviews.filter(receipt => {
    const matchesSearch = receipt.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    
    // Month filtering
    let matchesMonth = true;
    if (!selectedMonths.includes('all') && selectedMonths.length > 0) {
      const receiptDate = new Date(receipt.expense_date || receipt.created_at);
      const receiptMonth = `${receiptDate.getFullYear()}-${String(receiptDate.getMonth() + 1).padStart(2, '0')}`;
      matchesMonth = selectedMonths.includes(receiptMonth);
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleSelectReceipt = (receiptId: string) => {
    setSelectedReceipts(prev => 
      prev.includes(receiptId) 
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  };

  const handleSelectAll = () => {
    setSelectedReceipts(
      selectedReceipts.length === filteredReceipts.length 
        ? [] 
        : filteredReceipts.map(r => r.id)
    );
  };

  const handleMonthToggle = (month: string) => {
    if (selectedMonths.includes('all')) {
      setSelectedMonths([month]);
    } else {
      setSelectedMonths(prev => 
        prev.includes(month) 
          ? prev.filter(m => m !== month)
          : [...prev, month]
      );
    }
  };

  const handleSelectAllMonths = () => {
    setSelectedMonths(['all']);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast.error('Please upload an image or PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      uploadReceipt.mutate(file, {
        onSuccess: () => {
          toast.success('Receipt uploaded successfully');
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        onError: (error) => {
          toast.error('Failed to upload receipt');
          console.error('Upload error:', error);
        }
      });
    }
  };

  const handleExport = () => {
    if (selectedReceipts.length === 0) return;
    
    selectedReceipts.forEach(receiptId => {
      updateReceiptStatus.mutate({ receiptId, status: 'Exported' });
    });
    
    toast.success(`${selectedReceipts.length} receipt(s) marked as exported`);
    setSelectedReceipts([]);
  };

  const handleViewReceipt = async (receipt: Receipt) => {
    // Mark as reviewed
    if (receipt.status === 'New') {
      updateReceiptStatus.mutate({ receiptId: receipt.id, status: 'Reviewed' });
    }

    if (!receipt.storage_path) {
      toast.error('Receipt file not found');
      return;
    }

    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Authentication required to view receipts');
        return;
      }

      // Remove bucket prefix if it exists since we specify the bucket in .from()
      let filePath = receipt.storage_path;
      if (filePath.startsWith('receipts/')) {
        filePath = filePath.substring('receipts/'.length);
      }

      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (data?.signedUrl) {
        setPreviewModal({ isOpen: true, receipt });
      } else {
        toast.error('Unable to load receipt preview');
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast.error('Failed to load receipt preview');
    }
  };

  const handleOpenInNewTab = async (receipt: Receipt) => {
    // Mark as reviewed
    if (receipt.status === 'New') {
      updateReceiptStatus.mutate({ receiptId: receipt.id, status: 'Reviewed' });
    }

    if (!receipt.storage_path) {
      toast.error('Receipt file not found');
      return;
    }

    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Authentication required to access receipts');
        return;
      }

      // Remove bucket prefix if it exists since we specify the bucket in .from()
      let filePath = receipt.storage_path;
      if (filePath.startsWith('receipts/')) {
        filePath = filePath.substring('receipts/'.length);
      }

      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 3600); // 1 hour expiry
      
      if (data?.signedUrl) {
        // For mobile compatibility
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
          window.location.href = data.signedUrl;
        } else {
          const newWindow = window.open(data.signedUrl, '_blank');
          if (!newWindow) {
            window.location.href = data.signedUrl;
          }
        }
      } else {
        toast.error('Unable to open receipt');
      }
    } catch (error) {
      console.error('Error creating signed URL:', error);
      toast.error('Failed to open receipt');
    }
  };

  const handleDownloadReceipt = async (receipt: Receipt) => {
    if (!receipt.storage_path) {
      toast.error('Receipt file not found');
      return;
    }

    setLoadingDownloads(prev => new Set(prev).add(receipt.id));

    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Authentication required to download receipts');
        return;
      }

      // Remove bucket prefix if it exists since we specify the bucket in .from()
      let filePath = receipt.storage_path;
      if (filePath.startsWith('receipts/')) {
        filePath = filePath.substring('receipts/'.length);
      }

      const { data } = await supabase.storage
        .from('receipts')
        .createSignedUrl(filePath, 900); // 15 minutes for download
      
      if (data?.signedUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = receipt.file_name || `receipt-${receipt.id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Receipt downloaded successfully');
      } else {
        toast.error('Unable to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    } finally {
      setLoadingDownloads(prev => {
        const newSet = new Set(prev);
        newSet.delete(receipt.id);
        return newSet;
      });
    }
  };

  const handleDeleteReceipt = async (receipt: Receipt) => {
    if (!receipt.storage_path) {
      toast.error('Receipt file not found');
      return;
    }

    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Authentication required to delete receipts');
        return;
      }

      // Delete from storage first
      let filePath = receipt.storage_path;
      if (filePath.startsWith('receipts/')) {
        filePath = filePath.substring('receipts/'.length);
      }

      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database using the hook
      deleteReceipt.mutate(receipt.id, {
        onSuccess: () => {
          toast.success('Receipt deleted successfully');
          setDeleteConfirm({ isOpen: false, receipt: null });
          // Remove from selected receipts if it was selected
          setSelectedReceipts(prev => prev.filter(id => id !== receipt.id));
        },
        onError: (error) => {
          console.error('Database deletion error:', error);
          toast.error('Failed to delete receipt from database');
        }
      });

    } catch (error) {
      console.error('Error deleting receipt:', error);
      toast.error('Failed to delete receipt');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading receipts...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Month Filter Sidebar */}
      <div className="w-64 flex-shrink-0">
        <MonthFilter 
          selectedMonths={selectedMonths}
          onMonthToggle={handleMonthToggle}
          onSelectAll={handleSelectAllMonths}
          availableMonths={availableMonths}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <PageTitle 
          title={t('receipts')} 
          subtitle="Manage and track your receipts and expenses"
        />
        
        {/* Header Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-black border-gray-200 dark:border-gray-700"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Reviewed">Reviewed</SelectItem>
                <SelectItem value="Exported">Exported</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              onClick={handleExport}
              disabled={selectedReceipts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedReceipts.length})
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadReceipt.isPending}
            >
              {uploadReceipt.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Receipt
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Status Summary */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'All', value: 'all', count: receipts.length, accent: true },
            { label: 'New', value: 'New', count: receipts.filter(r => r.status === 'New').length, accent: false },
            { label: 'Reviewed', value: 'Reviewed', count: receipts.filter(r => r.status === 'Reviewed').length, accent: false },
            { label: 'Exported', value: 'Exported', count: receipts.filter(r => r.status === 'Exported').length, accent: false },
          ].map(({ label, value, count, accent }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 ${
                statusFilter === value
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <p className={`text-xs font-medium mb-1 ${statusFilter === value ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{label}</p>
              <p className={`text-2xl font-semibold tracking-tight ${statusFilter === value ? 'text-white' : 'text-zinc-900 dark:text-zinc-50'}`}>{count}</p>
            </button>
          ))}
        </div>

        {/* Receipts List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* List Header */}
          <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-zinc-300 dark:border-zinc-600"
                  aria-label="Select all receipts"
                />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">Select all</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {filteredReceipts.length} of {receipts.length} receipts
              </span>
            </div>
          </div>

          {/* Receipts Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReceipts.map((receipt) => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  isSelected={selectedReceipts.includes(receipt.id)}
                  onSelect={handleSelectReceipt}
                  onView={handleViewReceipt}
                  onOpenInNewTab={handleOpenInNewTab}
                  onDownload={handleDownloadReceipt}
                  onDelete={(receipt) => setDeleteConfirm({ isOpen: true, receipt })}
                  isDownloading={loadingDownloads.has(receipt.id)}
                />
              ))}
            </div>

            {filteredReceipts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">No receipts found</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first receipt to get started.'}
                </p>
                <Button
                  size="sm"
                  className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={previewModal.isOpen} onOpenChange={(open) => setPreviewModal({ isOpen: open, receipt: null })}>
          <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Receipt Preview</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewModal({ isOpen: false, receipt: null })}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {previewModal.receipt && (
              <div className="space-y-4">
                {/* Receipt Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {previewModal.receipt.vendor || 'Unknown Vendor'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {previewModal.receipt.expense_date 
                        ? new Date(previewModal.receipt.expense_date).toLocaleDateString()
                        : 'No date'
                      } • ${previewModal.receipt.total_amount || '0.00'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInNewTab(previewModal.receipt!)}
                      className="bg-white dark:bg-black border-gray-200 dark:border-gray-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(previewModal.receipt!)}
                      disabled={loadingDownloads.has(previewModal.receipt!.id)}
                      className="bg-white dark:bg-black border-gray-200 dark:border-gray-700"
                    >
                      {loadingDownloads.has(previewModal.receipt!.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>

                {/* Receipt Preview */}
                <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  {receiptsWithPreviews.find(r => r.id === previewModal.receipt!.id)?.previewUrl ? (
                    <img
                      src={receiptsWithPreviews.find(r => r.id === previewModal.receipt!.id)?.previewUrl}
                      alt={`Receipt from ${previewModal.receipt.vendor || 'Unknown vendor'}`}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <FileText className="h-12 w-12 text-gray-400" />
                      <span className="ml-2 text-gray-500 dark:text-gray-400">Preview not available</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && setDeleteConfirm({ isOpen: false, receipt: null })}>
          <AlertDialogContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Receipt</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this receipt from{' '}
                <span className="font-medium">{deleteConfirm.receipt?.vendor || 'Unknown Vendor'}</span>?{' '}
                This action cannot be undone and will permanently remove the receipt file and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                className="bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                disabled={deleteReceipt.isPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm.receipt && handleDeleteReceipt(deleteConfirm.receipt)}
                disabled={deleteReceipt.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteReceipt.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Receipt'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Receipts;
