-- 0) Deduplicate existing store_subscriptions by store_id before adding unique index
WITH ranked AS (
  SELECT 
    id,
    store_id,
    ROW_NUMBER() OVER (
      PARTITION BY store_id 
      ORDER BY expires_at DESC, updated_at DESC, created_at DESC
    ) AS rn
  FROM public.store_subscriptions
)
DELETE FROM public.store_subscriptions s
USING ranked r
WHERE s.id = r.id
  AND r.rn > 1;

-- 1) Ensure one subscription per store to support ON CONFLICT (store_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'uq_store_subscriptions_store_id'
  ) THEN
    CREATE UNIQUE INDEX uq_store_subscriptions_store_id
    ON public.store_subscriptions (store_id);
  END IF;
END $$;

-- 2) Create or replace approval function to extend from existing expiry/trial based on amount
CREATE OR REPLACE FUNCTION public.handle_transfer_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _base_timestamp timestamptz;
  _current_expires_at timestamptz;
  _trial_ends_at timestamptz;
  _new_expires_at timestamptz;
  _plan text;
  _interval interval;
BEGIN
  -- Only proceed if status changed from pending to verified
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'verified' THEN

    -- Determine plan/interval from amount (TWD)
    IF NEW.amount IS NOT NULL AND NEW.amount >= 3600 THEN
      _plan := 'yearly';
      _interval := interval '365 days';
    ELSIF NEW.amount IS NOT NULL AND NEW.amount >= 1200 THEN
      _plan := 'quarterly';
      _interval := interval '90 days';
    ELSE
      _plan := 'monthly';
      _interval := interval '30 days';
    END IF;

    -- Fetch current subscription state (if any)
    SELECT s.expires_at, s.trial_ends_at
    INTO _current_expires_at, _trial_ends_at
    FROM public.store_subscriptions s
    WHERE s.store_id = NEW.store_id
    LIMIT 1;

    -- Calculate base timestamp: the latest among current expiry, trial end, and now
    _base_timestamp := GREATEST(
      COALESCE(_current_expires_at, '-infinity'),
      COALESCE(_trial_ends_at, '-infinity'),
      timezone('utc', now())
    );

    _new_expires_at := _base_timestamp + _interval;

    -- Upsert subscription: activate and extend expiry
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
      _plan,
      'active',
      _new_expires_at,
      true,
      'bank_transfer',
      timezone('utc', now()),
      timezone('utc', now())
    )
    ON CONFLICT (store_id)
    DO UPDATE SET
      plan_type = EXCLUDED.plan_type,
      status = 'active',
      expires_at = GREATEST(
        COALESCE(public.store_subscriptions.expires_at, '-infinity'),
        COALESCE(public.store_subscriptions.trial_ends_at, '-infinity'),
        timezone('utc', now())
      ) + _interval,
      auto_renew = true,
      payment_source = 'bank_transfer',
      updated_at = timezone('utc', now());

    -- Log the approval activity
    INSERT INTO public.activity_logs (
      entity_type, entity_id, activity_type, description, performed_by, metadata, created_at
    ) VALUES (
      'store',
      NEW.store_id::text,
      'subscription_activated',
      'Subscription extended via bank transfer approval',
      COALESCE(auth.uid()::text, 'system'),
      jsonb_build_object(
        'transfer_id', NEW.id,
        'transfer_code', NEW.transfer_code,
        'amount', NEW.amount,
        'currency', NEW.currency,
        'plan_type', _plan
      ),
      timezone('utc', now())
    );

  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Ensure the trigger exists on bank_transfer_submissions for status updates
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trg_handle_transfer_approval' 
  ) THEN
    CREATE TRIGGER trg_handle_transfer_approval
    AFTER UPDATE ON public.bank_transfer_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_transfer_approval();
  END IF;
END $$;