-- Add subscription fields to optometrist_profiles
ALTER TABLE public.optometrist_profiles 
ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS paid_until timestamp with time zone NOT NULL DEFAULT (now() + interval '14 days'),
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'bank_transfer',
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create payment_status enum
DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment_provider enum
DO $$ BEGIN
    CREATE TYPE public.payment_provider AS ENUM ('bank_transfer', 'admin_free', 'newebpay', 'tappay', 'ecpay');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.optometrist_profiles(user_id) ON DELETE CASCADE,
    amount numeric NOT NULL DEFAULT 0,
    currency text NOT NULL DEFAULT 'TWD',
    plan_type text NOT NULL,
    payment_provider text NOT NULL DEFAULT 'bank_transfer',
    provider_trade_no text,
    status text NOT NULL DEFAULT 'pending',
    note text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments" 
ON public.payments 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments" 
ON public.payments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update payments" 
ON public.payments 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete payments" 
ON public.payments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at on payments
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_active boolean;
    v_paid_until timestamp with time zone;
    v_plan_type text;
BEGIN
    SELECT is_active, paid_until, plan_type 
    INTO v_is_active, v_paid_until, v_plan_type
    FROM public.optometrist_profiles 
    WHERE user_id = p_user_id;
    
    IF v_is_active IS NULL THEN
        RETURN 'not_found';
    END IF;
    
    IF v_is_active = false THEN
        RETURN 'blocked';
    END IF;
    
    IF v_paid_until >= now() THEN
        RETURN 'active';
    END IF;
    
    RETURN 'expired';
END;
$$;