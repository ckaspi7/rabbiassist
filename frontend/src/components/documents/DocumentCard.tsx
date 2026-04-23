
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Reviewed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Exported':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipts':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'trips':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'whatsapp':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
      <Card 
        className={`group overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 cursor-pointer ${
          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Top Half - Thumbnail */}
        <div className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
          {/* Selection Checkbox */}
          <div className="checkbox-container absolute top-3 left-3 z-10" onClick={e => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1.5 shadow-md">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              <FileText className="h-16 w-16 text-gray-400" />
            </div>
          )}
          
          {/* MIME Type Icon */}
          <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-md">
            {getMimeTypeIcon()}
          </div>

          {/* Hover Overlay */}
          <div className="action-button absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-3">
              <button
                onClick={handlePreview}
                className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Eye className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
              <button
                onClick={handleDownload}
                className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Download className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Half - Info */}
        <div className="p-4">
          {/* File Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate text-lg">
            {document.title}
          </h3>
          
          {/* Upload Date */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Uploaded: {formatDate(document.uploadDate)}
          </p>

          {/* Amount for receipts */}
          {document.type === 'receipts' && document.amount && (
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-3">
              ${document.amount}
            </p>
          )}

          {/* Bottom Row - Labels and Actions */}
          <div className="flex items-center justify-between">
            {/* Labels */}
            <div className="flex gap-2">
              <Badge className={`text-xs px-2 py-1 rounded-lg ${getTypeColor(document.type)}`}>
                {getTypeLabel()}
              </Badge>
              <Badge className={`text-xs px-2 py-1 rounded-lg ${getStatusColor(document.status)}`}>
                {document.status}
              </Badge>
            </div>

            {/* Actions */}
            <div className="action-button flex gap-2">
              <button
                onClick={handlePreview}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {document.title}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
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
