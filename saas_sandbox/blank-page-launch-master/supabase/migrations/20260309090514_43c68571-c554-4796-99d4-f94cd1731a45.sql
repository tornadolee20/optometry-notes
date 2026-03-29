
-- Fix: Remove anonymous SELECT from customer_keyword_logs (error-level finding)
DROP POLICY IF EXISTS "customer_keyword_logs_select_policy" ON public.customer_keyword_logs;
CREATE POLICY "customer_keyword_logs_select_policy"
  ON public.customer_keyword_logs
  FOR SELECT
  USING (
    is_super_admin() OR 
    (store_id IN (SELECT stores.id FROM stores WHERE stores.user_id = auth.uid()))
  );

-- Fix: Remove anonymous cross-store enumeration from store_keywords SELECT
DROP POLICY IF EXISTS "Public can view keywords of active stores only" ON public.store_keywords;
CREATE POLICY "Public can view keywords of active stores only"
  ON public.store_keywords
  FOR SELECT
  USING (
    is_super_admin() OR
    (EXISTS (SELECT 1 FROM stores s WHERE s.id = store_keywords.store_id AND s.user_id = auth.uid())) OR
    ((auth.uid() IS NULL) AND is_subscription_active(store_id) AND store_id IS NOT NULL)
  );
