
import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  MoreVertical, 
  Eye, 
  ExternalLink, 
  Download, 
  Trash2, 
  Calendar, 
  DollarSign,
  FileText,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Receipt } from '../../hooks/useReceipts';

interface ReceiptCardProps {
  receipt: Receipt & { previewUrl?: string };
  isSelected: boolean;
  onSelect: (receiptId: string) => void;
  onView: (receipt: Receipt) => void;
  onOpenInNewTab: (receipt: Receipt) => void;
  onDownload: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
  isDownloading: boolean;
}

const ReceiptCard = ({ 
  receipt, 
  isSelected, 
  onSelect, 
  onView, 
  onOpenInNewTab, 
  onDownload, 
  onDelete,
  isDownloading 
}: ReceiptCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'Reviewed':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'Exported':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300';
    }
  };

  const ReceiptPreviewImage = () => {
    if (!receipt.previewUrl || imageError || !receipt.mime_type?.startsWith('image/')) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        <img
          src={receipt.previewUrl}
          alt={`Receipt from ${receipt.vendor || 'Unknown vendor'}`}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      </div>
    );
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Card 
          className="relative group hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          onClick={() => onView(receipt)}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-3 left-3 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(receipt.id);
              }}
              className="rounded border-gray-300 dark:border-gray-600"
              aria-label={`Select receipt from ${receipt.vendor || 'Unknown vendor'}`}
            />
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClass(receipt.status || 'New')}`}>
              {receipt.status || 'New'}
            </span>
          </div>

          {/* Receipt Preview */}
          <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            <ReceiptPreviewImage />
          </div>

          {/* Receipt Details */}
          <div className="p-3">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">
              {receipt.vendor || 'Unknown Vendor'}
            </h3>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {receipt.expense_date ? new Date(receipt.expense_date).toLocaleDateString() : 'No date'}
                </div>
                <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                  <DollarSign className="h-3 w-3" />
                  {receipt.total_amount || '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(receipt);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenInNewTab(receipt);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(receipt);
                  }}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(receipt);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-white dark:bg-black border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Receipt Details</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">File:</span>
              <span className="text-xs text-gray-900 dark:text-white font-medium">{receipt.file_name}</span>
            </div>
            {receipt.vendor && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Vendor:</span>
                <span className="text-xs text-gray-900 dark:text-white font-medium">{receipt.vendor}</span>
              </div>
            )}
            {receipt.total_amount && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="text-xs text-gray-900 dark:text-white font-medium">${receipt.total_amount}</span>
              </div>
            )}
            {receipt.received_date && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Received:</span>
                <span className="text-xs text-gray-900 dark:text-white">{new Date(receipt.received_date).toLocaleDateString()}</span>
              </div>
            )}
            {receipt.expense_date && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Expense Date:</span>
                <span className="text-xs text-gray-900 dark:text-white">{new Date(receipt.expense_date).toLocaleDateString()}</span>
              </div>
            )}
            {receipt.category && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Category:</span>
                <span className="text-xs text-gray-900 dark:text-white">{receipt.category}</span>
              </div>
            )}
            {receipt.details && (
              <div className="flex justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Details:</span>
                <span className="text-xs text-gray-900 dark:text-white">{receipt.details}</span>
              </div>
            )}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ReceiptCard;
