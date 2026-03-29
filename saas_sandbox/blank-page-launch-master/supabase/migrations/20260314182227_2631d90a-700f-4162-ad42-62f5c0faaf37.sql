
CREATE TABLE public.frontend_error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id text NOT NULL,
  message text NOT NULL,
  stack text,
  component_stack text,
  route text,
  user_agent text,
  user_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.frontend_error_logs ENABLE ROW LEVEL SECURITY;

-- Allow Edge Function (service_role) to insert
CREATE POLICY "frontend_error_logs_insert_system"
  ON public.frontend_error_logs FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role'::text);

-- Allow super admins to read
CREATE POLICY "frontend_error_logs_select_admin"
  ON public.frontend_error_logs FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Auto-cleanup: keep 30 days
CREATE OR REPLACE FUNCTION public.cleanup_frontend_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.frontend_error_logs
  WHERE created_at < now() - interval '30 days';
END;
$$;
