-- Add confirmed_at and admin_note columns to payments table
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz NULL,
ADD COLUMN IF NOT EXISTS admin_note text NULL;

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON public.payments(paid_at);