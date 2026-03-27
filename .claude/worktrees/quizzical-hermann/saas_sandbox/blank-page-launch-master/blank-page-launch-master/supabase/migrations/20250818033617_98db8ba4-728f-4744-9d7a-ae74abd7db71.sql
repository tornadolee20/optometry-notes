-- Phase 3: Secure sensitive data tables
-- Lock down payment, session, and monitoring data

-- 1. Update payment_transactions table RLS
DROP POLICY IF EXISTS "Allow insert to payment_transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "Allow read access to payment_transactions" ON public.payment_transactions;

CREATE POLICY "Users can view payments for their stores"
ON public.payment_transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores s 
    WHERE s.id = payment_transactions.store_id 
    AND (s.user_id = auth.uid() OR is_super_admin())
  )
);

CREATE POLICY "System can insert payment transactions"
ON public.payment_transactions
FOR INSERT
TO authenticated
WITH CHECK (is_super_admin() OR auth.role() = 'service_role');

-- 2. Update user_sessions table RLS
DROP POLICY IF EXISTS "Allow insert to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow read access to user_sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow update to user_sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR is_super_admin());

CREATE POLICY "Users can manage their own sessions"
ON public.user_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid() OR is_super_admin())
WITH CHECK (user_id = auth.uid() OR is_super_admin());

-- 3. Update login_attempts table RLS (admin only for security)
DROP POLICY IF EXISTS "Allow login attempts view" ON public.login_attempts;
DROP POLICY IF EXISTS "Allow login tracking" ON public.login_attempts;

CREATE POLICY "System can track login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (true); -- Allow system to log all attempts

CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (is_super_admin());

-- 4. Update system_logs table RLS (admin only)
DROP POLICY IF EXISTS "Allow system logging" ON public.system_logs;
DROP POLICY IF EXISTS "Allow system logs view" ON public.system_logs;

CREATE POLICY "System can create logs"
ON public.system_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view system logs"
ON public.system_logs
FOR SELECT
TO authenticated
USING (is_super_admin());

-- 5. Update activity_logs table RLS (user and admin access)
DROP POLICY IF EXISTS "Allow insert to activity_logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Allow read access to activity_logs" ON public.activity_logs;

CREATE POLICY "System can create activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view logs related to their entities"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (
  is_super_admin() OR 
  performed_by = auth.uid()::text OR
  (entity_type = 'store' AND entity_id IN (
    SELECT id::text FROM public.stores WHERE user_id = auth.uid()
  ))
);