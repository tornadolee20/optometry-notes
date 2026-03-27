-- Fix critical security vulnerabilities in RLS policies
-- This migration secures sensitive customer and system data

-- ========================================
-- 1. Fix stores table RLS policies
-- ========================================

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow read access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow update access to stores" ON public.stores;
DROP POLICY IF EXISTS "Allow insert access to stores" ON public.stores;

-- Create secure policies for stores table
-- Store owners can view/update their own stores
CREATE POLICY "owners_can_view_own_stores" 
ON public.stores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "owners_can_update_own_stores" 
ON public.stores 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Super admins can view all stores
CREATE POLICY "super_admins_can_view_all_stores" 
ON public.stores 
FOR SELECT 
USING (is_super_admin());

-- Super admins can update all stores
CREATE POLICY "super_admins_can_update_all_stores" 
ON public.stores 
FOR UPDATE 
USING (is_super_admin());

-- Allow authenticated users to create stores (with proper user_id check)
CREATE POLICY "authenticated_users_can_create_stores" 
ON public.stores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- ========================================
-- 2. Fix payment_transactions table RLS policies
-- ========================================

DROP POLICY IF EXISTS "Allow read access to payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Allow insert to payment_transactions" ON public.payment_transactions;

-- Store owners can view their own payment transactions
CREATE POLICY "owners_can_view_own_payments" 
ON public.payment_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = payment_transactions.store_id 
    AND s.user_id = auth.uid()
  )
);

-- Super admins can view all payment transactions
CREATE POLICY "super_admins_can_view_all_payments" 
ON public.payment_transactions 
FOR SELECT 
USING (is_super_admin());

-- Only system/service can insert payment transactions
CREATE POLICY "system_can_insert_payments" 
ON public.payment_transactions 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 3. Fix login_attempts table RLS policies
-- ========================================

DROP POLICY IF EXISTS "Allow login attempts view" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow login tracking" ON public.login_attempts;

-- Only super admins can view login attempts
CREATE POLICY "super_admins_can_view_login_attempts" 
ON public.login_attempts 
FOR SELECT 
USING (is_super_admin());

-- Only system can insert login attempts
CREATE POLICY "system_can_insert_login_attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 4. Fix admins table RLS policies
-- ========================================

DROP POLICY IF EXISTS "Allow admin access" ON public.admins;

-- Only super admins can view admin list
CREATE POLICY "super_admins_can_view_admins" 
ON public.admins 
FOR SELECT 
USING (is_super_admin());

-- Only super admins can manage admin accounts
CREATE POLICY "super_admins_can_manage_admins" 
ON public.admins 
FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- ========================================
-- 5. Fix system_logs table RLS policies
-- ========================================

DROP POLICY IF EXISTS "Allow system logs view" ON public.system_logs;
DROP POLICY IF EXISTS "Allow system logging" ON public.system_logs;

-- Only super admins can view system logs
CREATE POLICY "super_admins_can_view_system_logs" 
ON public.system_logs 
FOR SELECT 
USING (is_super_admin());

-- Only system can insert system logs
CREATE POLICY "system_can_insert_system_logs" 
ON public.system_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- ========================================
-- 6. Fix user_sessions table RLS policies
-- ========================================

DROP POLICY IF EXISTS "Allow read access to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow insert to user_sessions" ON public.user_sessions;

-- Users can only view their own sessions
CREATE POLICY "users_can_view_own_sessions" 
ON public.user_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "users_can_update_own_sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert sessions
CREATE POLICY "system_can_insert_sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- Super admins can view all sessions
CREATE POLICY "super_admins_can_view_all_sessions" 
ON public.user_sessions 
FOR SELECT 
USING (is_super_admin());

-- ========================================
-- 7. Ensure users table stays properly secured
-- ========================================

-- The users table already has good policies, but let's make sure super admins can view all users
CREATE POLICY IF NOT EXISTS "super_admins_can_view_all_users" 
ON public.users 
FOR SELECT 
USING (is_super_admin());

-- ========================================
-- Verification queries
-- ========================================

-- Verify the policies are properly set
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('stores', 'payment_transactions', 'login_attempts', 'admins', 'system_logs', 'user_sessions')
ORDER BY tablename, policyname;

SELECT '✅ Critical security vulnerabilities have been fixed!' as status;