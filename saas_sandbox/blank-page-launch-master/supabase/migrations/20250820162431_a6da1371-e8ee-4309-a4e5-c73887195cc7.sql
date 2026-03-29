-- Restrict public access to sensitive admin and monitoring tables
-- Update RLS policies to be more secure

-- 1. Fix admins table - should only be accessible by super admins
DROP POLICY IF EXISTS "Allow admin access" ON public.admins;
CREATE POLICY "Super admins only" ON public.admins FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 2. Fix monitoring_alerts - restrict public read access
DROP POLICY IF EXISTS "Allow read access to monitoring_alerts" ON public.monitoring_alerts;
CREATE POLICY "Admins can read monitoring alerts" ON public.monitoring_alerts FOR SELECT USING (is_super_admin());

-- 3. Fix monitoring_metrics - restrict public read access
DROP POLICY IF EXISTS "Allow read access to monitoring_metrics" ON public.monitoring_metrics;
CREATE POLICY "Admins can read monitoring metrics" ON public.monitoring_metrics FOR SELECT USING (is_super_admin());

-- 4. Restrict store_keywords public access - only allow reading for stores with active subscriptions
-- Keep the existing policy but add subscription check for anonymous users
CREATE POLICY "Public can view keywords of active stores only" ON public.store_keywords 
FOR SELECT 
USING (
  -- Allow if user owns the store or is admin
  (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_id AND s.user_id = auth.uid())) OR 
  is_super_admin() OR
  -- For anonymous users, only show keywords for stores with active subscriptions
  (auth.uid() IS NULL AND is_subscription_active(store_id))
);

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "store_keywords_select_public" ON public.store_keywords;