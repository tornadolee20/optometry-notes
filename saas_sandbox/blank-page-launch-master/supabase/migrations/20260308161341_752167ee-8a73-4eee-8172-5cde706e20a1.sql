-- Add customer management fields to stores table
ALTER TABLE public.stores 
  ADD COLUMN IF NOT EXISTS line_id text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.stores.line_id IS 'Customer LINE ID for contact';
COMMENT ON COLUMN public.stores.notes IS 'Admin notes about this customer';
COMMENT ON COLUMN public.stores.tags IS 'Tags for customer categorization';