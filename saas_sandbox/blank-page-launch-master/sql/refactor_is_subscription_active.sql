-- Updated is_subscription_active RPC
-- Uses `status` as primary source of truth, `expires_at` as secondary guard for trials.
--
-- Status mapping:
--   'active'   → true (regardless of expires_at)
--   'trial'    → true only if expires_at > now()
--   'past_due' → false
--   'canceled' → false
--   'expired'  → false
--   NULL/other → false

CREATE OR REPLACE FUNCTION public.is_subscription_active(_store_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.store_subscriptions s
    WHERE s.store_id = _store_id
      AND (
        -- Active subscriptions are always treated as valid
        s.status = 'active'
        OR
        -- Trial subscriptions are valid only while not expired
        (s.status = 'trial' AND s.expires_at > timezone('utc', now()))
      )
  );
$function$;
