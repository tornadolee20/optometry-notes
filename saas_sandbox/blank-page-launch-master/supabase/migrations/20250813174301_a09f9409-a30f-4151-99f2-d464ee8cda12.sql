-- Add missing custom_feelings column to customer_keyword_logs table
ALTER TABLE public.customer_keyword_logs 
ADD COLUMN custom_feelings text[] DEFAULT '{}';

-- Add comment to document the column purpose
COMMENT ON COLUMN public.customer_keyword_logs.custom_feelings IS 'Array of custom feelings/keywords entered by the user';