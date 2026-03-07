
-- Add status column to store_subscriptions table
ALTER TABLE public.store_subscriptions 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'cancelled'));

-- Add trial_ends_at column to store_subscriptions table  
ALTER TABLE public.store_subscriptions 
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Update existing records to have proper status based on expiry
UPDATE public.store_subscriptions 
SET status = CASE 
  WHEN expires_at > NOW() THEN 'active'
  ELSE 'inactive'
END;
