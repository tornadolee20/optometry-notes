-- Add payment_source field to track if subscription is paid or admin-granted
ALTER TABLE public.store_subscriptions 
ADD COLUMN payment_source TEXT DEFAULT 'paid' CHECK (payment_source IN ('paid', 'admin_granted', 'trial'));

-- Add comment to explain the field
COMMENT ON COLUMN public.store_subscriptions.payment_source IS 'Track source of subscription: paid (customer payment), admin_granted (free by admin), trial (trial period)';

-- Update existing records to have proper payment_source based on status
UPDATE public.store_subscriptions 
SET payment_source = CASE 
  WHEN status = 'trial' THEN 'trial'
  WHEN status = 'active' AND created_at = updated_at THEN 'admin_granted'  -- Likely admin created
  ELSE 'paid'
END;