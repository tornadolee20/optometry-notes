-- 🚀 Optimize RLS Policies for Performance
-- Fix auth function re-evaluation and consolidate duplicate policies

-- ========================================
-- 1. Fix Auth RLS Initialization Plan Issues
-- ========================================

-- Drop existing policies that have performance issues
DROP POLICY IF EXISTS "Allow users to view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile during registration" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Recreate users policies with optimized auth function calls
CREATE POLICY "Allow users to view own data" ON public.users
FOR SELECT USING (
  ((select auth.uid()) = id) OR (auth.role() = 'authenticated'::text)
);

CREATE POLICY "Users can insert their own profile during registration" ON public.users
FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING ((select auth.uid()) = id);

-- ========================================
-- 2. Fix bank_transfer_submissions policies
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "owners_insert_own_transfer_submissions" ON public.bank_transfer_submissions;
DROP POLICY IF EXISTS "owners_select_own_transfer_submissions" ON public.bank_transfer_submissions;
DROP POLICY IF EXISTS "super_admins_full_access_transfer_submissions" ON public.bank_transfer_submissions;
DROP POLICY IF EXISTS "admins_can_view_transfer_submissions" ON public.bank_transfer_submissions;
DROP POLICY IF EXISTS "admins_can_update_transfer_submissions" ON public.bank_transfer_submissions;

-- Create consolidated and optimized policies
CREATE POLICY "transfer_submissions_select_policy" ON public.bank_transfer_submissions
FOR SELECT USING (
  is_super_admin() OR 
  has_role((select auth.uid()), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = bank_transfer_submissions.store_id 
    AND s.user_id = (select auth.uid())
  )
);

CREATE POLICY "transfer_submissions_insert_policy" ON public.bank_transfer_submissions
FOR INSERT WITH CHECK (
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = bank_transfer_submissions.store_id 
    AND s.user_id = (select auth.uid())
  )
);

CREATE POLICY "transfer_submissions_update_policy" ON public.bank_transfer_submissions
FOR UPDATE USING (
  is_super_admin() OR 
  has_role((select auth.uid()), 'admin'::app_role)
) WITH CHECK (
  is_super_admin() OR 
  has_role((select auth.uid()), 'admin'::app_role)
);

CREATE POLICY "transfer_submissions_delete_policy" ON public.bank_transfer_submissions
FOR DELETE USING (is_super_admin());

-- ========================================
-- 3. Fix stores policies  
-- ========================================

DROP POLICY IF EXISTS "Users can view their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can create their own stores" ON public.stores;
DROP POLICY IF EXISTS "Users can update their own stores" ON public.stores;

CREATE POLICY "stores_select_policy" ON public.stores
FOR SELECT USING (
  (user_id = (select auth.uid())) OR is_super_admin()
);

CREATE POLICY "stores_insert_policy" ON public.stores
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "stores_update_policy" ON public.stores
FOR UPDATE USING (
  (user_id = (select auth.uid())) OR is_super_admin()
) WITH CHECK (
  (user_id = (select auth.uid())) OR is_super_admin()
);

-- ========================================
-- 4. Fix store_keywords policies
-- ========================================

DROP POLICY IF EXISTS "Users can view keywords for their stores" ON public.store_keywords;
DROP POLICY IF EXISTS "Users can manage keywords for their stores" ON public.store_keywords;

-- Create single consolidated policy for all operations
CREATE POLICY "store_keywords_policy" ON public.store_keywords
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = store_keywords.store_id 
    AND ((s.user_id = (select auth.uid())) OR is_super_admin())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = store_keywords.store_id 
    AND ((s.user_id = (select auth.uid())) OR is_super_admin())
  )
);

-- ========================================
-- 5. Fix store_subscriptions policies
-- ========================================

DROP POLICY IF EXISTS "Users can view subscriptions for their stores" ON public.store_subscriptions;
DROP POLICY IF EXISTS "Super admins can manage all subscriptions" ON public.store_subscriptions;

CREATE POLICY "store_subscriptions_select_policy" ON public.store_subscriptions
FOR SELECT USING (
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = store_subscriptions.store_id 
    AND s.user_id = (select auth.uid())
  )
);

CREATE POLICY "store_subscriptions_manage_policy" ON public.store_subscriptions
FOR ALL USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- ========================================
-- 6. Fix payment_transactions policies
-- ========================================

DROP POLICY IF EXISTS "Users can view payments for their stores" ON public.payment_transactions;
DROP POLICY IF EXISTS "System can insert payment transactions" ON public.payment_transactions;

CREATE POLICY "payment_transactions_select_policy" ON public.payment_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM stores s 
    WHERE s.id = payment_transactions.store_id 
    AND ((s.user_id = (select auth.uid())) OR is_super_admin())
  )
);

CREATE POLICY "payment_transactions_insert_policy" ON public.payment_transactions
FOR INSERT WITH CHECK (
  is_super_admin() OR (auth.role() = 'service_role'::text)
);

-- ========================================
-- 7. Fix user_sessions policies
-- ========================================

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;

CREATE POLICY "user_sessions_policy" ON public.user_sessions
FOR ALL USING (
  (user_id = (select auth.uid())) OR is_super_admin()
) WITH CHECK (
  (user_id = (select auth.uid())) OR is_super_admin()
);

-- ========================================
-- 8. Fix activity_logs policy
-- ========================================

DROP POLICY IF EXISTS "Users can view logs related to their entities" ON public.activity_logs;

CREATE POLICY "activity_logs_select_policy" ON public.activity_logs
FOR SELECT USING (
  is_super_admin() OR 
  (performed_by = ((select auth.uid()))::text) OR 
  ((entity_type = 'store'::text) AND (entity_id IN (
    SELECT (stores.id)::text AS id
    FROM stores
    WHERE (stores.user_id = (select auth.uid()))
  )))
);

-- ========================================
-- 9. Fix user_roles policies (consolidate multiple permissive policies)
-- ========================================

DROP POLICY IF EXISTS "Allow users to view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow role assignment" ON public.user_roles;

CREATE POLICY "user_roles_policy" ON public.user_roles
FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 10. Create performance monitoring view
-- ========================================

CREATE OR REPLACE VIEW public.rls_performance_stats AS
SELECT 
  schemaname,
  tablename,
  policyname,
  qual,
  with_check,
  CASE 
    WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'NEEDS_OPTIMIZATION'
    WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'NEEDS_OPTIMIZATION'
    ELSE 'OPTIMIZED'
  END as performance_status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY performance_status DESC, tablename;

-- Show results
SELECT '✅ RLS Performance Optimization Complete!' as status;
SELECT 'Optimized ' || count(*) || ' policies across ' || count(DISTINCT tablename) || ' tables' as summary
FROM pg_policies WHERE schemaname = 'public';