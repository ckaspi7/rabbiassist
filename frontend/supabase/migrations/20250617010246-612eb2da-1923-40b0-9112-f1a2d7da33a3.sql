
-- Add status column to receipts table
ALTER TABLE public.receipts 
ADD COLUMN status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Exported'));

-- Update existing receipts to have 'New' status
UPDATE public.receipts 
SET status = 'New' 
WHERE status IS NULL;
