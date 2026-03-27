-- Create backup management tables
CREATE TABLE IF NOT EXISTS public.system_backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('automatic', 'manual', 'emergency', 'scheduled')),
  backup_name TEXT NOT NULL,
  backup_metadata JSONB DEFAULT '{}',
  file_path TEXT,
  file_size BIGINT,
  backup_status TEXT NOT NULL DEFAULT 'in_progress' CHECK (backup_status IN ('in_progress', 'completed', 'failed', 'corrupted')),
  git_commit_hash TEXT,
  git_branch TEXT,
  database_snapshot_id TEXT,
  encryption_key_hash TEXT,
  verification_checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  notes TEXT
);

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS public.system_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  check_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  overall_health_score INTEGER NOT NULL CHECK (overall_health_score >= 0 AND overall_health_score <= 100),
  typescript_check BOOLEAN NOT NULL DEFAULT false,
  build_check BOOLEAN NOT NULL DEFAULT false,
  dependency_check BOOLEAN NOT NULL DEFAULT false,
  file_integrity_check BOOLEAN NOT NULL DEFAULT false,
  database_connectivity BOOLEAN NOT NULL DEFAULT false,
  response_time_ms INTEGER,
  error_details JSONB DEFAULT '{}',
  recommendations TEXT[],
  triggered_by TEXT DEFAULT 'manual',
  environment TEXT DEFAULT 'development'
);

-- Create disaster recovery events table
CREATE TABLE IF NOT EXISTS public.disaster_recovery_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('backup_created', 'backup_restored', 'system_rollback', 'health_check', 'emergency_recovery', 'auto_fix_attempt')),
  event_status TEXT NOT NULL CHECK (event_status IN ('started', 'completed', 'failed', 'cancelled')),
  backup_id UUID REFERENCES public.system_backups(id),
  triggered_by UUID,
  trigger_reason TEXT,
  execution_time_ms INTEGER,
  before_state JSONB DEFAULT '{}',
  after_state JSONB DEFAULT '{}',
  error_message TEXT,
  recovery_steps TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create automated backup schedule table
CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  backup_type TEXT NOT NULL DEFAULT 'automatic',
  retention_days INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  backup_config JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.system_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disaster_recovery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for super_admin access
CREATE POLICY "Super admins can manage all backup data" 
ON public.system_backups 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Super admins can view all health logs" 
ON public.system_health_logs 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Super admins can view all recovery events" 
ON public.disaster_recovery_events 
FOR ALL 
USING (public.is_super_admin());

CREATE POLICY "Super admins can manage backup schedules" 
ON public.backup_schedules 
FOR ALL 
USING (public.is_super_admin());

-- Create indexes for performance
CREATE INDEX idx_system_backups_created_at ON public.system_backups(created_at DESC);
CREATE INDEX idx_system_backups_backup_type ON public.system_backups(backup_type);
CREATE INDEX idx_system_backups_status ON public.system_backups(backup_status);
CREATE INDEX idx_health_logs_timestamp ON public.system_health_logs(check_timestamp DESC);
CREATE INDEX idx_recovery_events_created_at ON public.disaster_recovery_events(created_at DESC);
CREATE INDEX idx_recovery_events_type ON public.disaster_recovery_events(event_type);

-- Create function to calculate system health score
CREATE OR REPLACE FUNCTION public.calculate_system_health()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  health_score INTEGER := 0;
  db_health BOOLEAN := false;
  recent_errors INTEGER := 0;
BEGIN
  -- Check database connectivity (basic)
  BEGIN
    SELECT EXISTS(SELECT 1 FROM public.stores LIMIT 1) INTO db_health;
    IF db_health THEN
      health_score := health_score + 25;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    db_health := false;
  END;
  
  -- Check for recent errors (last hour)
  SELECT COUNT(*) INTO recent_errors
  FROM public.disaster_recovery_events 
  WHERE event_status = 'failed' 
    AND created_at > now() - interval '1 hour';
    
  -- Deduct points for recent errors
  health_score := health_score + GREATEST(0, 25 - (recent_errors * 5));
  
  -- Check backup recency (last 24 hours)
  IF EXISTS(
    SELECT 1 FROM public.system_backups 
    WHERE backup_status = 'completed' 
      AND created_at > now() - interval '24 hours'
  ) THEN
    health_score := health_score + 25;
  END IF;
  
  -- Base score for system being operational
  health_score := health_score + 25;
  
  RETURN LEAST(100, health_score);
END;
$$;

-- Create function to cleanup old backups
CREATE OR REPLACE FUNCTION public.cleanup_old_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark expired backups
  UPDATE public.system_backups 
  SET backup_status = 'expired'
  WHERE expires_at < now() 
    AND backup_status = 'completed';
    
  -- Delete old health logs (keep 30 days)
  DELETE FROM public.system_health_logs 
  WHERE check_timestamp < now() - interval '30 days';
  
  -- Delete old recovery events (keep 90 days)
  DELETE FROM public.disaster_recovery_events 
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- Create trigger for automatic cleanup
CREATE OR REPLACE FUNCTION public.auto_cleanup_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Run cleanup every 100 inserts to health logs
  IF (SELECT COUNT(*) FROM public.system_health_logs) % 100 = 0 THEN
    PERFORM public.cleanup_old_backups();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_cleanup
  AFTER INSERT ON public.system_health_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_cleanup_trigger();