
export interface UnifiedDocument {
  id: string;
  type: 'receipts' | 'trips' | 'whatsapp';
  title: string;
  fileName: string;
  uploadDate: string | null;
  status: 'New' | 'Reviewed' | 'Exported';
  storagePath: string | null;
  mimeType: string | null;
  
  // Receipt specific fields
  amount?: string | null;
  expenseDate?: string | null;
  details?: string | null;
  category?: string | null;
  
  // Trip document specific fields
  docType?: string | null;
  originalName?: string | null;
}
