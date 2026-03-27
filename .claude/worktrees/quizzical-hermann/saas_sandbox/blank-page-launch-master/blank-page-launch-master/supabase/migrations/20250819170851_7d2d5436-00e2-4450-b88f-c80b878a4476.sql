-- 🔒 Fix publicly writable tables that should be admin-only

-- Fix industry_keywords table - currently allows public updates
DROP POLICY IF EXISTS "Allow update access to industry_keywords" ON public.industry_keywords;

-- Only super admins can manage industry keywords
CREATE POLICY "industry_keywords_insert_admin" 
ON public.industry_keywords 
FOR INSERT 
WITH CHECK (is_super_admin());

CREATE POLICY "industry_keywords_update_admin" 
ON public.industry_keywords 
FOR UPDATE 
USING (is_super_admin())
WITH CHECK (is_super_admin());

CREATE POLICY "industry_keywords_delete_admin" 
ON public.industry_keywords 
FOR DELETE 
USING (is_super_admin());

-- Fix monitoring tables - currently allow public writes
DROP POLICY IF EXISTS "Allow insert to monitoring_alerts" ON public.monitoring_alerts;
DROP POLICY IF EXISTS "Allow update to monitoring_alerts" ON public.monitoring_alerts;
DROP POLICY IF EXISTS "Allow insert to monitoring_metrics" ON public.monitoring_metrics;

-- Only system/service role and super admins can manage monitoring data
CREATE POLICY "monitoring_alerts_insert_system" 
ON public.monitoring_alerts 
FOR INSERT 
WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

CREATE POLICY "monitoring_alerts_update_system" 
ON public.monitoring_alerts 
FOR UPDATE 
USING (is_super_admin() OR auth.role() = 'service_role')
WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

CREATE POLICY "monitoring_alerts_select_admin" 
ON public.monitoring_alerts 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "monitoring_metrics_insert_system" 
ON public.monitoring_metrics 
FOR INSERT 
WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

CREATE POLICY "monitoring_metrics_select_admin" 
ON public.monitoring_metrics 
FOR SELECT 
USING (is_super_admin());