-- Create storage buckets for disaster recovery
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('system-backups', 'system-backups', false, 52428800, ARRAY['application/json', 'application/gzip', 'text/csv', 'application/sql']),
  ('audit-logs', 'audit-logs', false, 10485760, ARRAY['application/json', 'text/csv']);

-- Storage policies for system-backups bucket
CREATE POLICY "Super admins can view backup files"
ON storage.objects FOR SELECT
USING (bucket_id = 'system-backups' AND is_super_admin());

CREATE POLICY "Super admins can upload backup files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'system-backups' AND is_super_admin());

CREATE POLICY "Super admins can update backup files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'system-backups' AND is_super_admin());

CREATE POLICY "Super admins can delete backup files"
ON storage.objects FOR DELETE
USING (bucket_id = 'system-backups' AND is_super_admin());

-- Storage policies for audit-logs bucket
CREATE POLICY "Super admins can view audit log files"
ON storage.objects FOR SELECT
USING (bucket_id = 'audit-logs' AND is_super_admin());

CREATE POLICY "Super admins can upload audit log files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audit-logs' AND is_super_admin());

CREATE POLICY "Super admins can update audit log files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'audit-logs' AND is_super_admin());

CREATE POLICY "Super admins can delete audit log files"
ON storage.objects FOR DELETE
USING (bucket_id = 'audit-logs' AND is_super_admin());

-- Create audit tables for critical data tracking
CREATE TABLE public.subscription_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  change_reason text,
  ip_address inet,
  user_agent text
);

CREATE TABLE public.store_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id uuid NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  change_reason text,
  ip_address inet,
  user_agent text
);

CREATE TABLE public.payment_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id uuid NOT NULL,
  operation_type text NOT NULL CHECK (operation_type IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  change_reason text,
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit tables
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit tables (super admin only)
CREATE POLICY "Super admins can view subscription audit logs"
ON public.subscription_audit_log FOR ALL
USING (is_super_admin());

CREATE POLICY "Super admins can view store audit logs"
ON public.store_audit_log FOR ALL
USING (is_super_admin());

CREATE POLICY "Super admins can view payment audit logs"
ON public.payment_audit_log FOR ALL
USING (is_super_admin());

-- Create audit trigger functions
CREATE OR REPLACE FUNCTION public.audit_subscription_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_enabled boolean;
BEGIN
  -- Check if audit is enabled
  SELECT COALESCE((setting_value->>'enabled')::boolean, false) INTO _audit_enabled
  FROM public.system_settings 
  WHERE setting_key = 'audit_logging_enabled';
  
  IF NOT _audit_enabled THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.subscription_audit_log (
    store_id,
    operation_type,
    old_values,
    new_values,
    changed_by,
    changed_at
  ) VALUES (
    COALESCE(NEW.store_id, OLD.store_id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_store_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_enabled boolean;
BEGIN
  -- Check if audit is enabled
  SELECT COALESCE((setting_value->>'enabled')::boolean, false) INTO _audit_enabled
  FROM public.system_settings 
  WHERE setting_key = 'audit_logging_enabled';
  
  IF NOT _audit_enabled THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.store_audit_log (
    store_id,
    operation_type,
    old_values,
    new_values,
    changed_by,
    changed_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_payment_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _audit_enabled boolean;
BEGIN
  -- Check if audit is enabled
  SELECT COALESCE((setting_value->>'enabled')::boolean, false) INTO _audit_enabled
  FROM public.system_settings 
  WHERE setting_key = 'audit_logging_enabled';
  
  IF NOT _audit_enabled THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.payment_audit_log (
    transaction_id,
    operation_type,
    old_values,
    new_values,
    changed_by,
    changed_at
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers (initially disabled via system settings)
CREATE TRIGGER audit_store_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.store_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.audit_subscription_changes();

CREATE TRIGGER audit_stores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.audit_store_changes();

CREATE TRIGGER audit_payment_transactions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_payment_changes();

-- Function to get critical backup data
CREATE OR REPLACE FUNCTION public.get_critical_backup_data()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  data_json jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Stores data
  RETURN QUERY
  SELECT 
    'stores'::text,
    count(*)::bigint,
    jsonb_agg(to_jsonb(s.*))
  FROM public.stores s;
  
  -- Store subscriptions data
  RETURN QUERY
  SELECT 
    'store_subscriptions'::text,
    count(*)::bigint,
    jsonb_agg(to_jsonb(ss.*))
  FROM public.store_subscriptions ss;
  
  -- Payment transactions data
  RETURN QUERY
  SELECT 
    'payment_transactions'::text,
    count(*)::bigint,
    jsonb_agg(to_jsonb(pt.*))
  FROM public.payment_transactions pt;
  
  -- Bank transfer submissions data
  RETURN QUERY
  SELECT 
    'bank_transfer_submissions'::text,
    count(*)::bigint,
    jsonb_agg(to_jsonb(bts.*))
  FROM public.bank_transfer_submissions bts;
END;
$$;

-- Function to schedule automatic backups
CREATE OR REPLACE FUNCTION public.schedule_automatic_backup(_backup_type text DEFAULT 'daily')
RETURNS TABLE(
  backup_id uuid,
  scheduled_at timestamp with time zone,
  backup_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _backup_id uuid;
  _scheduled_at timestamptz;
BEGIN
  _backup_id := gen_random_uuid();
  _scheduled_at := now();
  
  INSERT INTO public.system_backups (
    id,
    backup_name,
    backup_type,
    backup_status,
    created_at,
    created_by
  ) VALUES (
    _backup_id,
    'Auto-' || _backup_type || '-' || to_char(_scheduled_at, 'YYYY-MM-DD-HH24-MI-SS'),
    _backup_type,
    'scheduled',
    _scheduled_at,
    auth.uid()
  );
  
  RETURN QUERY
  SELECT _backup_id, _scheduled_at, _backup_type;
END;
$$;

-- Insert default system settings for disaster recovery
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('audit_logging_enabled', '{"enabled": false}'::jsonb, 'backup', 'Enable audit logging for critical tables'),
  ('auto_backup_enabled', '{"enabled": false}'::jsonb, 'backup', 'Enable automatic daily backups'),
  ('backup_retention_days', '{"days": 30}'::jsonb, 'backup', 'Number of days to retain backups'),
  ('disaster_recovery_enabled', '{"enabled": true}'::jsonb, 'backup', 'Enable disaster recovery features')
ON CONFLICT (setting_key) DO NOTHING;