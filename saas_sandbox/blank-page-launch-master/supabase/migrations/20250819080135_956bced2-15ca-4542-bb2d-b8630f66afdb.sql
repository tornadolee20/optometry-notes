-- 🔒 修復所有剩餘函數的搜尋路徑安全問題

-- 修復 is_super_admin 函數
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(public.has_role(auth.uid(), 'super_admin'::app_role), false);
$function$;

-- 修復 validate_store_keywords 函數
CREATE OR REPLACE FUNCTION public.validate_store_keywords()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Enforce keyword length between 3 and 7 characters (after trimming)
  IF NEW.keyword IS NULL OR char_length(btrim(NEW.keyword)) < 3 OR char_length(btrim(NEW.keyword)) > 7 THEN
    RAISE EXCEPTION 'Keyword length must be between 3 and 7 characters';
  END IF;

  -- Enforce max 48 keywords per store on INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.store_id IS NOT NULL THEN
      IF (SELECT count(*) FROM public.store_keywords WHERE store_id = NEW.store_id) >= 48 THEN
        RAISE EXCEPTION 'Maximum 48 keywords per store reached';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- 修復 create_initial_trial_subscription 函數
CREATE OR REPLACE FUNCTION public.create_initial_trial_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Only insert if no subscription exists yet for this store
  if not exists (
    select 1 from public.store_subscriptions s where s.store_id = new.id
  ) then
    insert into public.store_subscriptions (
      store_id,
      plan_type,
      status,
      expires_at,
      trial_ends_at,
      auto_renew,
      payment_source
    ) values (
      new.id,
      'trial',
      'trial',
      timezone('utc', now()) + interval '7 days',
      timezone('utc', now()) + interval '7 days',
      false,
      'trial'
    );
  end if;
  return new;
end;
$function$;

-- 修復 handle_transfer_approval 函數
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