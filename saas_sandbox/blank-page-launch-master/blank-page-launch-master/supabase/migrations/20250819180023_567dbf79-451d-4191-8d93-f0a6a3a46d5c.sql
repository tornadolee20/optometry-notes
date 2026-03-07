
-- 1) monitoring_alerts: remove redundant admin SELECT policy (public read remains)
DROP POLICY IF EXISTS "monitoring_alerts_select_admin" ON public.monitoring_alerts;

-- 2) monitoring_metrics: remove redundant admin SELECT policy (public read remains)
DROP POLICY IF EXISTS "monitoring_metrics_select_admin" ON public.monitoring_metrics;

-- 3) users: merge two SELECT policies into one
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
DROP POLICY IF EXISTS "users_select_super_admin" ON public.users;

CREATE POLICY "users_select_own_or_admin"
  ON public.users
  FOR SELECT
  USING (
    is_super_admin()
    OR (id = (SELECT auth.uid()))
  );

-- 4) store_subscriptions: replace ALL policy with write-only admin policies, keep existing SELECT policy
DROP POLICY IF EXISTS "store_subscriptions_manage_policy" ON public.store_subscriptions;

-- admin can INSERT
CREATE POLICY "store_subscriptions_insert_admin"
  ON public.store_subscriptions
  FOR INSERT
  WITH CHECK (is_super_admin());

-- admin can UPDATE
CREATE POLICY "store_subscriptions_update_admin"
  ON public.store_subscriptions
  FOR UPDATE
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- admin can DELETE
CREATE POLICY "store_subscriptions_delete_admin"
  ON public.store_subscriptions
  FOR DELETE
  USING (is_super_admin());
