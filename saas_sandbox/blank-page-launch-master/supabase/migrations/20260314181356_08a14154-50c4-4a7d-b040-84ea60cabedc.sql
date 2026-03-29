-- Schedule hourly subscription expiry check
SELECT cron.schedule(
  'expire-stale-subscriptions',
  '0 * * * *',
  $$SELECT public.expire_stale_subscriptions()$$
);