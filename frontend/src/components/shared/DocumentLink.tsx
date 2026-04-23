
import React, { useState } from 'react';
import { Download, FileText, File, Image, Video, Music, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';

interface DocumentLinkProps {
  fileName: string;
  storagePath: string | null;
  className?: string;
  variant?: 'button' | 'card';
}

const DocumentLink = ({ fileName, storagePath, className = '', variant = 'button' }: DocumentLinkProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-4 w-4 text-purple-500" />;
      case 'mp3':
      case 'wav':
        return <Music className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const downloadDocument = async () => {
    if (!storagePath) {
      toast({
        title: 'Error',
        description: 'No file path available for this document',
        variant: 'destructive'
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Check authentication status
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access documents',
          variant: 'destructive'
        });
        return;
      }
      
      // Remove bucket prefix if it exists since we specify the bucket in .from()
      let filePath = storagePath;
      if (filePath.startsWith('trip-documents/')) {
        filePath = filePath.substring('trip-documents/'.length);
      }

      // Generate signed URL for secure download (15 minutes expiry)
      const { data, error } = await supabase.storage
        .from('trip-documents')
        .createSignedUrl(filePath, 900); // 15 minutes (900 seconds)

      if (error) {
        console.error('Storage error:', error);
        toast({
          title: 'Download Failed',
          description: 'Unable to generate download link. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      if (!data.signedUrl) {
        toast({
          title: 'Error',
          description: 'Unable to generate download link',
          variant: 'destructive'
        });
        return;
      }

      // Open in new tab without affecting current page
      const newWindow = window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback for popup blockers - but still try to open in new tab
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: 'Success',
        description: 'Opening document in new tab',
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Download Failed',
        description: 'Unable to download file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Don't render if no storage path
  if (!storagePath) {
    console.log('DocumentLink not rendering - no storage path for:', fileName);
    return (
      <div className="text-xs text-gray-500 dark:text-gray-400 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded">
        No file path available
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card 
        className={`p-3 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-gray-900 ${isDownloading ? 'opacity-50' : ''} ${className}`}
        onClick={downloadDocument}
      >
        <div className="flex items-center gap-3">
          {getFileIcon(fileName)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isDownloading ? 'Opening document...' : 'Click to view'}
            </p>
          </div>
          {isDownloading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          ) : (
            <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </Card>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadDocument}
      disabled={isDownloading}
      className={`flex items-center gap-2 h-8 text-xs bg-white dark:bg-black border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 ${className}`}
    >
      {getFileIcon(fileName)}
      <span className="truncate max-w-[120px]">{fileName}</span>
      {isDownloading ? (
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      ) : (
        <Download className="h-3 w-3" />
      )}
    </Button>
  );
};

export default DocumentLink;
