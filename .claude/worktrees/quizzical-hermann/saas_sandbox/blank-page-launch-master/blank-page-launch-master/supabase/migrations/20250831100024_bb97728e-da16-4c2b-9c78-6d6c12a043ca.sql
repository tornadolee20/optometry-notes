-- Add search_path to functions missing it to satisfy linter
CREATE OR REPLACE FUNCTION public.cleanup_function_usage_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.function_usage_logs 
  WHERE created_at < now() - interval '24 hours';
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_cleanup_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Run cleanup every 100 inserts to health logs
  IF (SELECT COUNT(*) FROM public.system_health_logs) % 100 = 0 THEN
    PERFORM public.cleanup_old_backups();
  END IF;
  RETURN NEW;
END;
$function$;