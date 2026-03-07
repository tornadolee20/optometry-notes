-- Add trigger to automatically create trial subscription for new stores
CREATE TRIGGER create_trial_subscription_trigger
    AFTER INSERT ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.create_initial_trial_subscription();

-- Backfill trial subscriptions for existing stores that don't have any subscription
INSERT INTO public.store_subscriptions (
  store_id,
  plan_type,
  status,
  expires_at,
  trial_ends_at,
  auto_renew,
  payment_source,
  created_at,
  updated_at
)
SELECT 
  s.id as store_id,
  'trial' as plan_type,
  'trial' as status,
  timezone('utc', now()) + interval '7 days' as expires_at,
  timezone('utc', now()) + interval '7 days' as trial_ends_at,
  false as auto_renew,
  'trial' as payment_source,
  timezone('utc', now()) as created_at,
  timezone('utc', now()) as updated_at
FROM public.stores s
LEFT JOIN public.store_subscriptions sub ON s.id = sub.store_id
WHERE sub.store_id IS NULL;