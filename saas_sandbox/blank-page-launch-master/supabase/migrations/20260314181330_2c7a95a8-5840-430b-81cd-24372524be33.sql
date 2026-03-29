-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to mark expired subscriptions
CREATE OR REPLACE FUNCTION public.expire_stale_subscriptions()
RETURNS TABLE(expired_count int, notified_count int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _expired_count int;
BEGIN
  -- Mark subscriptions where expires_at has passed and status is still active/trial
  WITH updated AS (
    UPDATE public.store_subscriptions
    SET status = 'expired',
        updated_at = timezone('utc', now())
    WHERE expires_at < timezone('utc', now())
      AND status IN ('active', 'trial')
    RETURNING store_id
  )
  SELECT count(*) INTO _expired_count FROM updated;

  -- Log activity if any subscriptions were expired
  IF _expired_count > 0 THEN
    INSERT INTO public.activity_logs (
      entity_type, entity_id, activity_type, description, performed_by, metadata, created_at
    ) VALUES (
      'system',
      'subscription-expiry-cron',
      'subscriptions_expired',
      format('Automated expiry: %s subscriptions marked as expired', _expired_count),
      'system',
      jsonb_build_object(
        'expired_count', _expired_count,
        'run_at', timezone('utc', now())::text
      ),
      timezone('utc', now())
    );
  END IF;

  RETURN QUERY SELECT _expired_count, 0::int;
END;
$$;