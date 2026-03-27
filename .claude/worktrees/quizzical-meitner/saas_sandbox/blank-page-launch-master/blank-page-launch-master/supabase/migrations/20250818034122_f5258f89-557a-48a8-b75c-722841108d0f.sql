-- Create automatic subscription activation trigger for bank transfers

-- 1. Create function to handle transfer approval
CREATE OR REPLACE FUNCTION public.handle_transfer_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if status changed from pending to verified
  IF OLD.status = 'pending' AND NEW.status = 'verified' THEN
    
    -- Update or insert store subscription
    INSERT INTO public.store_subscriptions (
      store_id,
      plan_type,
      status,
      expires_at,
      auto_renew,
      payment_source,
      created_at,
      updated_at
    ) VALUES (
      NEW.store_id,
      'monthly', -- Default to monthly plan
      'active',
      timezone('utc', now()) + interval '30 days',
      true,
      'bank_transfer',
      timezone('utc', now()),
      timezone('utc', now())
    )
    ON CONFLICT (store_id) 
    DO UPDATE SET
      status = 'active',
      expires_at = timezone('utc', now()) + interval '30 days',
      payment_source = 'bank_transfer',
      updated_at = timezone('utc', now());

    -- Log the approval activity
    INSERT INTO public.activity_logs (
      entity_type,
      entity_id,
      activity_type,
      description,
      performed_by,
      metadata,
      created_at
    ) VALUES (
      'store',
      NEW.store_id::text,
      'subscription_activated',
      'Subscription activated via bank transfer approval',
      COALESCE(auth.uid()::text, 'system'),
      jsonb_build_object(
        'transfer_id', NEW.id,
        'transfer_code', NEW.transfer_code,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'approval_notes', COALESCE(NEW.notes, '')
      ),
      timezone('utc', now())
    );

  END IF;

  RETURN NEW;
END;
$$;

-- 2. Create trigger on bank_transfer_submissions
DROP TRIGGER IF EXISTS trigger_transfer_approval ON public.bank_transfer_submissions;

CREATE TRIGGER trigger_transfer_approval
  AFTER UPDATE ON public.bank_transfer_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transfer_approval();

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_bank_transfer_submissions_status_store 
ON public.bank_transfer_submissions(status, store_id);

-- 4. Add constraint to prevent duplicate pending transfers per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_transfer_per_store
ON public.bank_transfer_submissions(store_id, transfer_code)
WHERE status = 'pending';