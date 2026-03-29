
-- =============================================
-- Fix 1: Prevent privilege escalation on users table
-- Users should NOT be able to update their own 'role' column
-- =============================================

-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Recreate with column restrictions (no role update allowed)
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid()));

-- Fix system_settings policies to use is_super_admin() instead of users.role
DROP POLICY IF EXISTS "Only admins can view system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;

CREATE POLICY "Only admins can view system settings"
ON public.system_settings FOR SELECT
USING (is_super_admin());

CREATE POLICY "Only admins can insert system settings"
ON public.system_settings FOR INSERT
WITH CHECK (is_super_admin());

CREATE POLICY "Only admins can update system settings"
ON public.system_settings FOR UPDATE
USING (is_super_admin());

-- =============================================
-- Fix 2: Lock down customer_keyword_logs
-- Remove public read/write, restrict to store owners + admins
-- =============================================

DROP POLICY IF EXISTS "Allow read access to customer_keyword_logs" ON public.customer_keyword_logs;
DROP POLICY IF EXISTS "Allow insert access to customer_keyword_logs" ON public.customer_keyword_logs;

-- SELECT: store owner or super_admin, OR anonymous with active subscription (for review page)
CREATE POLICY "customer_keyword_logs_select_policy"
ON public.customer_keyword_logs FOR SELECT
USING (
  is_super_admin()
  OR (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  OR (auth.uid() IS NULL AND is_subscription_active(store_id))
);

-- INSERT: authenticated store owner, super_admin, or anonymous with active subscription (review page)
CREATE POLICY "customer_keyword_logs_insert_policy"
ON public.customer_keyword_logs FOR INSERT
WITH CHECK (
  is_super_admin()
  OR (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
  OR (auth.uid() IS NULL AND is_subscription_active(store_id))
);
