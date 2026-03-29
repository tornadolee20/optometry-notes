
-- Fix overly permissive INSERT policies with WITH CHECK (true)

-- 1. activity_logs: restrict INSERT to service_role or super_admin
DROP POLICY IF EXISTS "System can create activity logs" ON public.activity_logs;
CREATE POLICY "System can create activity logs"
  ON public.activity_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    (auth.role() = 'service_role') OR is_super_admin()
  );

-- 2. login_attempts: restrict INSERT to service_role only
DROP POLICY IF EXISTS "System can track login attempts" ON public.login_attempts;
CREATE POLICY "System can track login attempts"
  ON public.login_attempts
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    (auth.role() = 'service_role')
  );

-- 3. system_logs: restrict INSERT to service_role or super_admin
DROP POLICY IF EXISTS "System can create logs" ON public.system_logs;
CREATE POLICY "System can create logs"
  ON public.system_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    (auth.role() = 'service_role') OR is_super_admin()
  );
