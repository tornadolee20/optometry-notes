-- Fix RLS performance by wrapping auth calls with SELECT
-- This improves performance without changing authorization behavior

-- Fix stores table policies
DROP POLICY IF EXISTS "stores_select_owner_or_admin" ON public.stores;
CREATE POLICY "stores_select_owner_or_admin" ON public.stores
  FOR SELECT USING ((user_id = (SELECT auth.uid())) OR is_super_admin());

-- Fix store_keywords table policies
DROP POLICY IF EXISTS "store_keywords_insert_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_insert_owner_with_active_subscription_or_admin" ON public.store_keywords
  FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM stores s
  WHERE ((s.id = store_keywords.store_id) AND (s.user_id = (SELECT auth.uid()))))) AND is_subscription_active(store_id)) OR is_super_admin());

DROP POLICY IF EXISTS "store_keywords_update_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_update_owner_with_active_subscription_or_admin" ON public.store_keywords
  FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM stores s
  WHERE ((s.id = store_keywords.store_id) AND (s.user_id = (SELECT auth.uid()))))) AND is_subscription_active(store_id)) OR is_super_admin())
  WITH CHECK (((EXISTS ( SELECT 1
   FROM stores s
  WHERE ((s.id = store_keywords.store_id) AND (s.user_id = (SELECT auth.uid()))))) AND is_subscription_active(store_id)) OR is_super_admin());

DROP POLICY IF EXISTS "store_keywords_delete_owner_with_active_subscription_or_admin" ON public.store_keywords;
CREATE POLICY "store_keywords_delete_owner_with_active_subscription_or_admin" ON public.store_keywords
  FOR DELETE USING (((EXISTS ( SELECT 1
   FROM stores s
  WHERE ((s.id = store_keywords.store_id) AND (s.user_id = (SELECT auth.uid()))))) AND is_subscription_active(store_id)) OR is_super_admin());

-- Fix monitoring_alerts table policies
DROP POLICY IF EXISTS "monitoring_alerts_insert_system" ON public.monitoring_alerts;
CREATE POLICY "monitoring_alerts_insert_system" ON public.monitoring_alerts
  FOR INSERT WITH CHECK (is_super_admin() OR ((SELECT auth.role()) = 'service_role'::text));

DROP POLICY IF EXISTS "monitoring_alerts_update_system" ON public.monitoring_alerts;
CREATE POLICY "monitoring_alerts_update_system" ON public.monitoring_alerts
  FOR UPDATE USING (is_super_admin() OR ((SELECT auth.role()) = 'service_role'::text))
  WITH CHECK (is_super_admin() OR ((SELECT auth.role()) = 'service_role'::text));

-- Fix monitoring_metrics table policies
DROP POLICY IF EXISTS "monitoring_metrics_insert_system" ON public.monitoring_metrics;
CREATE POLICY "monitoring_metrics_insert_system" ON public.monitoring_metrics
  FOR INSERT WITH CHECK (is_super_admin() OR ((SELECT auth.role()) = 'service_role'::text));

-- Fix payment_transactions table policies
DROP POLICY IF EXISTS "payment_transactions_insert_policy" ON public.payment_transactions;
CREATE POLICY "payment_transactions_insert_policy" ON public.payment_transactions
  FOR INSERT WITH CHECK (is_super_admin() OR ((SELECT auth.role()) = 'service_role'::text));

-- Fix user_roles table policies
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Fix users table policies
DROP POLICY IF EXISTS "users_select_own_profile" ON public.users;
CREATE POLICY "users_select_own_profile" ON public.users
  FOR SELECT USING (id = (SELECT auth.uid()));