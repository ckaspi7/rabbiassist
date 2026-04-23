
import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { FileText, Download, Eye, File, Image as ImageIcon } from 'lucide-react';
import { UnifiedDocument } from '../../types/documents';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentCardProps {
  document: UnifiedDocument;
  isSelected?: boolean;
  onSelect?: () => void;
}

const DocumentCard = ({ document, isSelected = false, onSelect }: DocumentCardProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      if (document.storagePath) {
        try {
          let filePath = document.storagePath;
          let bucketName = 'receipts'; // default
          
          // Determine bucket based on document type
          if (document.type === 'trips') {
            bucketName = 'trip-documents';
          } else if (document.type === 'whatsapp') {
            bucketName = 'whatsapp-documents';
          }
          
          // Remove bucket prefix if it exists
          if (filePath.startsWith(`${bucketName}/`)) {
            filePath = filePath.substring(`${bucketName}/`.length);
          }

          const { data } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 3600);
          
          if (data?.signedUrl) {
            setPreviewUrl(data.signedUrl);
          }
        } catch (error) {
          console.error('Error creating preview URL:', error);
        }
      }
      setIsLoadingPreview(false);
    };

    generatePreview();
  }, [document]);

  const getTypeLabel = () => {
    switch (document.type) {
      case 'receipts':
        return 'Receipts';
      case 'trips':
        return 'Trips';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return 'Document';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
      case 'Reviewed':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
      case 'Exported':
        return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
      default:
        return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipts':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
      case 'trips':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
      default:
        return 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const getMimeTypeIcon = () => {
    const mimeType = document.mimeType?.toLowerCase() || '';
    if (mimeType.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <ImageIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreviewModal(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!document.storagePath) {
      toast.error('Document file not found');
      return;
    }

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Authentication required to access documents');
        return;
      }

      let filePath = document.storagePath;
      let bucketName = 'receipts'; // default
      
      // Determine bucket based on document type
      if (document.type === 'trips') {
        bucketName = 'trip-documents';
      } else if (document.type === 'whatsapp') {
        bucketName = 'whatsapp-documents';
      }
      
      // Remove bucket prefix if it exists
      if (filePath.startsWith(`${bucketName}/`)) {
        filePath = filePath.substring(`${bucketName}/`.length);
      }

      const { data } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600);
      
      if (data?.signedUrl) {
        // Open in new tab without affecting current page
        const newWindow = window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
        if (!newWindow) {
          // Fallback for popup blockers
          window.open(data.signedUrl, '_blank');
        }
        toast.success('Opening document in new tab');
      } else {
        toast.error('Unable to open document');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error('Failed to open document');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on interactive elements
    if ((e.target as Element).closest('.checkbox-container, .action-button')) {
      return;
    }
    onSelect?.();
  };

  return (
    <>
      <div
        className={`group overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 border border-zinc-100 dark:border-zinc-800 cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Top Half - Thumbnail */}
        <div className="relative aspect-[4/3] bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
          {/* Selection Checkbox */}
          <div className="checkbox-container absolute top-3 left-3 z-10" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-1.5 shadow-md">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={onSelect}
                className="rounded-md"
              />
            </div>
          </div>
          {isLoadingPreview ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : previewUrl && document.mimeType?.startsWith('image/') ? (
            <img
              src={previewUrl}
              alt={document.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800">
              <FileText className="h-14 w-14 text-zinc-300 dark:text-zinc-500" />
            </div>
          )}
          
          {/* MIME Type Icon */}
          <div className="absolute top-3 right-3 bg-white dark:bg-zinc-900 rounded-lg p-2 shadow-md">
            {getMimeTypeIcon()}
          </div>

          {/* Hover Overlay */}
          <div className="action-button absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="bg-white dark:bg-zinc-800 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Eye className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </button>
              <button
                onClick={handleDownload}
                className="bg-white dark:bg-zinc-800 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Download className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Half - Info */}
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-0.5 truncate text-sm tracking-tight">
            {document.title}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
            {formatDate(document.uploadDate)}
          </p>

          {document.type === 'receipts' && document.amount && (
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 font-mono mb-3">
              ${document.amount}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${getTypeColor(document.type)}`}>
                {getTypeLabel()}
              </Badge>
              <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${getStatusColor(document.status)}`}>
                {document.status}
              </Badge>
            </div>

            <div className="action-button flex gap-1">
              <button
                onClick={handlePreview}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Eye className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                {document.title}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {document.mimeType?.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={document.title}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : (
                <iframe
                  src={previewUrl}
                  className="w-full h-[70vh] border-0"
                  title={document.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentCard;
